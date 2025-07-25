import { z } from "zod";
import {
  contentBlockOutputSchema,
  contentBlockSchema,
  inputSchema,
  jsonInferenceOutputSchema,
  displayInputSchema,
  type ContentBlockOutput,
  type JsonInferenceOutput,
  displayModelInferenceInputMessageSchema,
} from "./common";
import { JSONValueSchema } from "../tensorzero";

export const providerInferenceExtraBodySchema = z.object({
  model_provider_name: z.string(),
  pointer: z.string(),
  value: JSONValueSchema,
});
export type ProviderInferenceExtraBody = z.infer<
  typeof providerInferenceExtraBodySchema
>;

export const variantInferenceExtraBodySchema = z.object({
  variant_name: z.string(),
  pointer: z.string(),
  value: JSONValueSchema,
});
export type VariantInferenceExtraBody = z.infer<
  typeof variantInferenceExtraBodySchema
>;

export const inferenceExtraBodySchema = z.union([
  providerInferenceExtraBodySchema,
  variantInferenceExtraBodySchema,
]);
export type InferenceExtraBody = z.infer<typeof inferenceExtraBodySchema>;

export const inferenceByIdRowSchema = z
  .object({
    id: z.string().uuid(),
    function_name: z.string(),
    variant_name: z.string(),
    episode_id: z.string().uuid(),
    function_type: z.enum(["chat", "json"]),
    timestamp: z.string().datetime(),
  })
  .strict();

export type InferenceByIdRow = z.infer<typeof inferenceByIdRowSchema>;

export const episodeByIdSchema = z
  .object({
    episode_id: z.string().uuid(),
    count: z.number().min(1),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    last_inference_id: z.string().uuid(),
  })
  .strict();

export type EpisodeByIdRow = z.infer<typeof episodeByIdSchema>;

export const chatInferenceRowSchema = z.object({
  id: z.string().uuid(),
  function_name: z.string(),
  variant_name: z.string(),
  episode_id: z.string().uuid(),
  input: z.string(),
  output: z.string(),
  tool_params: z.string(),
  inference_params: z.string(),
  processing_time_ms: z.number(),
  timestamp: z.string().datetime(),
  extra_body: z.string().nullable(),
  tags: z.record(z.string(), z.string()).default({}),
});

export type ChatInferenceRow = z.infer<typeof chatInferenceRowSchema>;

export const jsonInferenceRowSchema = z.object({
  id: z.string().uuid(),
  function_name: z.string(),
  variant_name: z.string(),
  episode_id: z.string().uuid(),
  input: z.string(),
  output: z.string(),
  output_schema: z.string(),
  inference_params: z.string(),
  processing_time_ms: z.number(),
  timestamp: z.string().datetime(),
  extra_body: z.string().nullable(),
  tags: z.record(z.string(), z.string()).default({}),
});

export type JsonInferenceRow = z.infer<typeof jsonInferenceRowSchema>;

export const inferenceRowSchema = z.discriminatedUnion("function_type", [
  chatInferenceRowSchema.extend({
    function_type: z.literal("chat"),
  }),
  jsonInferenceRowSchema.extend({
    function_type: z.literal("json"),
  }),
]);

export type InferenceRow = z.infer<typeof inferenceRowSchema>;

export const parsedChatInferenceRowSchema = chatInferenceRowSchema
  .omit({
    input: true,
    output: true,
    inference_params: true,
    tool_params: true,
    extra_body: true,
  })
  .extend({
    input: inputSchema,
    output: z.array(contentBlockOutputSchema),
    inference_params: z.record(z.string(), z.unknown()),
    tool_params: z.record(z.string(), z.unknown()),
    extra_body: inferenceExtraBodySchema.nullable(),
  });

export type ParsedChatInferenceRow = z.infer<
  typeof parsedChatInferenceRowSchema
>;

export const parsedJsonInferenceRowSchema = jsonInferenceRowSchema
  .omit({
    input: true,
    output: true,
    inference_params: true,
    output_schema: true,
    extra_body: true,
  })
  .extend({
    input: inputSchema,
    output: jsonInferenceOutputSchema,
    inference_params: z.record(z.string(), z.unknown()),
    output_schema: z.record(z.string(), z.unknown()),
    extra_body: inferenceExtraBodySchema.nullable(),
  });

export type ParsedJsonInferenceRow = z.infer<
  typeof parsedJsonInferenceRowSchema
>;

export const parsedInferenceRowSchema = z.discriminatedUnion("function_type", [
  parsedChatInferenceRowSchema.extend({
    function_type: z.literal("chat"),
    input: displayInputSchema,
  }),
  parsedJsonInferenceRowSchema.extend({
    function_type: z.literal("json"),
    input: displayInputSchema,
  }),
]);

export type ParsedInferenceRow = z.infer<typeof parsedInferenceRowSchema>;

export function parseInferenceOutput(
  output: string,
): ContentBlockOutput[] | JsonInferenceOutput {
  const parsed = JSON.parse(output);
  if (Array.isArray(parsed)) {
    return z.array(contentBlockOutputSchema).parse(parsed);
  }
  return jsonInferenceOutputSchema.parse(parsed);
}

export const modelInferenceRowSchema = z.object({
  id: z.string().uuid(),
  inference_id: z.string().uuid(),
  raw_request: z.string(),
  raw_response: z.string(),
  model_name: z.string(),
  model_provider_name: z.string(),
  input_tokens: z.number().nullable(),
  output_tokens: z.number().nullable(),
  response_time_ms: z.number(),
  ttft_ms: z.number().nullable(),
  timestamp: z.string().datetime(),
  system: z.string().nullable(),
  input_messages: z.string(),
  output: z.string(),
  cached: z.boolean(),
});

export type ModelInferenceRow = z.infer<typeof modelInferenceRowSchema>;

export const parsedModelInferenceRowSchema = modelInferenceRowSchema
  .omit({
    input_messages: true,
    output: true,
  })
  .extend({
    input_messages: z.array(displayModelInferenceInputMessageSchema),
    output: z.array(contentBlockSchema),
  });

export type ParsedModelInferenceRow = z.infer<
  typeof parsedModelInferenceRowSchema
>;

export const adjacentIdsSchema = z.object({
  previous_id: z.string().uuid().nullable(),
  next_id: z.string().uuid().nullable(),
});

export type AdjacentIds = z.infer<typeof adjacentIdsSchema>;
