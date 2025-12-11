import Anthropic from '@anthropic-ai/sdk';
import { allTools } from '@/lib/tools/tool-definitions';
import { runTool } from '@/lib/tools/tool-executor';
import { ORCHESTRATOR_SYSTEM_PROMPT } from './system-prompt';
import { OrchestratorContext } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export class LoanOrchestrator {
  private context: OrchestratorContext;

  constructor(initialContext?: Partial<OrchestratorContext>) {
    this.context = {
      conversationHistory: [],
      currentStage: 'sales',
      metadata: {},
      ...initialContext,
    };
  }

  // Main entry point
  async processMessage(userMessage: string): Promise<string> {
    console.log(`[Orchestrator] User message: ${userMessage}`);

    // Add user message to conversation history
    this.context.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // Send message to Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: ORCHESTRATOR_SYSTEM_PROMPT,
        messages: this.context.conversationHistory,
      });

      const completion = response.completion || '';
      console.log('[Orchestrator] Model response:', completion);

      // Try parsing as tool call JSON
      let toolResults: any[] = [];
      let finalResponse = completion;

      try {
        const parsed = JSON.parse(completion);
        if (parsed.tool && parsed.input) {
          const agentName = this.getAgentNameFromTool(parsed.tool);
          const result = await runTool(parsed.tool, parsed.input, agentName);

          toolResults.push(result);
          this.updateContextFromToolResult(parsed.tool, result);

          // Add tool result to conversation history
          this.context.conversationHistory.push({
            role: 'user',
            content: JSON.stringify(toolResults),
          });

          // Second pass for final assistant response
          const secondResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: ORCHESTRATOR_SYSTEM_PROMPT,
            messages: this.context.conversationHistory,
          });

          finalResponse = secondResponse.completion || 'I could not process your request completely.';
        }
      } catch {
        // Not a tool call, treat as normal completion
      }

      // Add final assistant response to history
      this.context.conversationHistory.push({
        role: 'assistant',
        content: finalResponse,
      });

      return finalResponse;
    } catch (error: any) {
      console.error('[Orchestrator] Error:', error);
      const errorMessage = `I encountered an error: ${error.message}`;
      this.context.conversationHistory.push({
        role: 'assistant',
        content: errorMessage,
      });
      return errorMessage;
    }
  }

  // Map tool name to agent
  private getAgentNameFromTool(toolName: string): string {
    if (['get_customer_info', 'create_loan_application', 'get_loan_products'].includes(toolName))
      return 'Sales Agent';
    if (['get_kyc_status', 'verify_documents', 'initiate_video_kyc'].includes(toolName))
      return 'Verification Agent';
    if (['get_credit_report', 'check_loan_eligibility', 'calculate_risk_score'].includes(toolName))
      return 'Underwriting Agent';
    if (['generate_loan_offer', 'send_sanction_letter', 'schedule_disbursement'].includes(toolName))
      return 'Sanction Agent';
    return 'Unknown Agent';
  }

  // Update orchestrator context based on tool result
  private updateContextFromToolResult(toolName: string, result: any): void {
    if (toolName === 'create_loan_application' && result.success) {
      this.context.applicationId = result.data.applicationId;
      this.context.customerId = result.data.customerId;
      this.context.currentStage = 'verification';
    } else if (toolName === 'verify_documents' && result.success) {
      this.context.currentStage = 'underwriting';
    } else if (toolName === 'check_loan_eligibility' && result.success) {
      this.context.currentStage = 'sanction';
    } else if (toolName === 'schedule_disbursement' && result.success) {
      this.context.currentStage = 'complete';
    }
  }

  // Retrieve current context
  getContext(): OrchestratorContext {
    return this.context;
  }
}
