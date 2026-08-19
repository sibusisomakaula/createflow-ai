export type GeneratorType = "email" | "blog" | "social" | "product" | "code";

const baseRole = "You are CreateFlow AI, a professional AI content creation assistant.";

export function buildPrompt(type: GeneratorType, fields: Record<string, string>) {
  const safe = (key: string) => (fields[key] ?? "").trim().slice(0, 4000);
  const common = `ROLE: ${baseRole}\nOBJECTIVE: Create useful, accurate, relevant content.\nUSER CONTEXT: ${JSON.stringify(fields)}\nCONSTRAINTS: Never invent facts, names, specifications, or sources that were not provided. Do not add filler. Follow safety policies.`;
  switch (type) {
    case "email":
      return `${common}\nTASK: Write an email for the stated purpose.\nTONE: ${safe("tone")}\nREQUIREMENTS: Include a subject, greeting, body, and closing. Recipient context is optional.\nOUTPUT FORMAT: Use markdown headings: Subject, Greeting, Email body, Closing.\nPurpose: ${safe("purpose")}\nRecipient: ${safe("recipient")}\nAdditional instructions: ${safe("instructions")}`;
    case "blog":
      return `${common}\nTASK: Write a structured blog post.\nTONE: ${safe("tone")}\nREQUIREMENTS: Include a title, introduction, useful headings, substantive main content, and conclusion.\nOUTPUT FORMAT: Markdown with clear headings. Length: ${safe("length")}.\nTopic: ${safe("topic")}\nTarget audience: ${safe("audience")}\nAdditional instructions: ${safe("instructions")}`;
    case "social":
      return `${common}\nTASK: Write a platform-appropriate social media post.\nTONE: ${safe("tone")}\nREQUIREMENTS: Match the conventions of the selected platform; do not use the same style for every platform.\nOUTPUT FORMAT: Return the post copy, followed by an optional short note titled Platform notes.\nTopic: ${safe("topic")}\nPlatform: ${safe("platform")}\nAdditional instructions: ${safe("instructions")}`;
    case "product":
      return `${common}\nTASK: Write a compelling product description without inventing specifications.\nTONE: ${safe("tone")}\nREQUIREMENTS: Include product title, short description, main description, and key benefits.\nOUTPUT FORMAT: Markdown with clear headings.\nProduct name: ${safe("name")}\nProduct type: ${safe("productType")}\nKey features: ${safe("features")}\nTarget customer: ${safe("customer")}`;
    case "code":
      return `${common}\nTASK: Generate safe, maintainable code for the requested task.\nTONE: Clear and technical.\nREQUIREMENTS: Do not generate malware, credential theft, destructive payloads, or other harmful functionality. Explain assumptions briefly.\nOUTPUT FORMAT: Return one fenced code block in ${safe("language")}, then headings Short explanation and Usage notes.\nTask: ${safe("task")}\nAdditional requirements: ${safe("requirements")}`;
  }
}

export function getRequiredField(type: GeneratorType, fields: Record<string, string>) {
  const required: Record<GeneratorType, string> = {
    email: "purpose",
    blog: "topic",
    social: "topic",
    product: "name",
    code: "task",
  };
  return Boolean((fields[required[type]] ?? "").trim());
}
