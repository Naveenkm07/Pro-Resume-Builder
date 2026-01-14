declare module "mammoth" {
  export interface ExtractRawTextResult {
    value: string;
    messages?: Array<{ type: string; message: string }>;
  }

  export function extractRawText(options: { path: string }): Promise<ExtractRawTextResult>;
}
