export type PromptMode = 'general' | 'feature' | 'bugfix';

export interface GeneralPromptData {
  task: string;
  context: string;
  style: string;
  outputFormat: string;
  rules: string;
}

export interface FeaturePromptData {
  projectDescription: string;
  techStack: string;
  currentFeatures: string;
  newFeatureRequirement: string;
  constraints: string;
}

export interface BugFixPromptData {
  projectDescription: string;
  techStack: string;
  bugDescription: string;
  errorLogs: string;
  expectedBehavior: string;
}

export type PromptData = GeneralPromptData | FeaturePromptData | BugFixPromptData;

export interface HistoryItem {
  id: string;
  mode: PromptMode;
  data: PromptData;
  generatedPrompt: string;
  timestamp: number;
}

export const generatePrompt = (mode: PromptMode, data: PromptData): string => {
  switch (mode) {
    case 'general':
      return generateGeneralPrompt(data as GeneralPromptData);
    case 'feature':
      return generateFeaturePrompt(data as FeaturePromptData);
    case 'bugfix':
      return generateBugFixPrompt(data as BugFixPromptData);
    default:
      return '';
  }
};

const generateGeneralPrompt = (data: GeneralPromptData): string => {
  return `Please act as an expert AI assistant and complete the following task.

### 🎯 Task
${data.task}

### 📝 Context
${data.context}

### 🎨 Style & Tone
${data.style || 'Professional, clear, and concise.'}

### 📋 Output Format
${data.outputFormat || 'Structured markdown format.'}

### ⚠️ Rules & Constraints
${data.rules || 'None specified.'}

### 🚀 Execution Plan Request
Before providing the final output, please outline a brief execution plan detailing how you will approach this task.`;
};

const generateFeaturePrompt = (data: FeaturePromptData): string => {
  return `Please act as an expert Senior Software Engineer and help me develop a new feature for my project.

### 🎯 Task
Implement a new feature based on the requirements below.

### 🏢 Project Context
${data.projectDescription}

### 🛠️ Existing Tech Stack
${data.techStack}

### 🧩 Current System / Features
${data.currentFeatures || 'Not specified.'}

### ✨ New Feature Requirements
${data.newFeatureRequirement}

### ⚠️ Constraints & Limitations
${data.constraints || 'None specified.'}

### 📋 Output Requirements
Please provide the following:
1. **Execution Plan:** A brief step-by-step plan before writing code.
2. **App Architecture:** How this feature fits into the existing logic.
3. **Component Breakdown:** List of new or modified components.
4. **Folder Structure:** Where new files should be placed.
5. **Step-by-step Development Guide:** Clear instructions.
6. **Full Code:** Modular, reusable, and scalable code (using React functional components + hooks if applicable).
7. **Best Practices:** Scalability and performance ideas.

### ⚠️ Rules
- Avoid unnecessary complexity.
- Follow clean naming conventions.
- Design with a real-world developer workflow in mind.
- Clarify any ambiguities before proceeding.`;
};

const generateBugFixPrompt = (data: BugFixPromptData): string => {
  return `Please act as an expert Senior Software Engineer and help me debug and fix an issue in my project.

### 🎯 Task
Diagnose and fix the bug described below.

### 🏢 Project Context
${data.projectDescription}

### 🛠️ Tech Stack
${data.techStack}

### 🐛 Bug Description
${data.bugDescription}

### ❌ Error Message / Logs
\`\`\`
${data.errorLogs || 'No logs provided.'}
\`\`\`

### ✅ Expected Behavior
${data.expectedBehavior}

### 📋 Output Requirements
Please provide the following:
1. **Execution Plan:** A brief step-by-step plan before writing code.
2. **Debug Strategy:** How you analyzed the issue.
3. **Root Cause Analysis:** What caused the bug.
4. **Solution:** Step-by-step guide to fixing it.
5. **Full Code:** The corrected code (modular and clean).
6. **Best Practices:** How to prevent this in the future.

### ⚠️ Rules
- Avoid unnecessary complexity.
- Follow clean naming conventions.
- Design with a real-world developer workflow in mind.
- Clarify any ambiguities before proceeding.`;
};
