import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PromptMode, PromptData, GeneralPromptData, FeaturePromptData, BugFixPromptData } from '@/lib/prompt-templates';

interface DynamicFormProps {
  mode: PromptMode;
  formData: Partial<PromptData>;
  onChange: (field: string, value: string) => void;
}

export function DynamicForm({ mode, formData, onChange }: DynamicFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.name, e.target.value);
  };

  if (mode === 'general') {
    const data = formData as Partial<GeneralPromptData>;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task">Task <span className="text-destructive">*</span></Label>
          <Input id="task" name="task" placeholder="e.g., Write a React component for a login form" value={data.task || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Describe the specific action you want the AI to perform.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="context">Context <span className="text-destructive">*</span></Label>
          <Textarea id="context" name="context" placeholder="e.g., I am building a SaaS app for project management..." value={data.context || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Provide background information about your project or goal.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="style">Style & Tone</Label>
          <Input id="style" name="style" placeholder="e.g., Professional, concise, step-by-step" value={data.style || ''} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">Specify how the AI should sound (e.g., technical, beginner-friendly).</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="outputFormat">Output Format</Label>
          <Input id="outputFormat" name="outputFormat" placeholder="e.g., Markdown, JSON, Code only" value={data.outputFormat || ''} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">How should the response be structured?</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rules">Rules</Label>
          <Textarea id="rules" name="rules" placeholder="e.g., Use Tailwind CSS, avoid class components" value={data.rules || ''} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">List any strict constraints or guidelines the AI must follow.</p>
        </div>
      </div>
    );
  }

  if (mode === 'feature') {
    const data = formData as Partial<FeaturePromptData>;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectDescription">Project Description <span className="text-destructive">*</span></Label>
          <Textarea id="projectDescription" name="projectDescription" placeholder="e.g., An e-commerce platform selling digital goods" value={data.projectDescription || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Briefly explain what your application does.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="techStack">Existing Tech Stack <span className="text-destructive">*</span></Label>
          <Input id="techStack" name="techStack" placeholder="e.g., Next.js, Tailwind, Supabase" value={data.techStack || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">List the languages, frameworks, and libraries you are using.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentFeatures">Current Features</Label>
          <Textarea id="currentFeatures" name="currentFeatures" placeholder="e.g., User auth, product listing, cart" value={data.currentFeatures || ''} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">Describe the existing functionality related to this new feature.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newFeatureRequirement">New Feature Requirement <span className="text-destructive">*</span></Label>
          <Textarea id="newFeatureRequirement" name="newFeatureRequirement" placeholder="e.g., Add a wishlist feature where users can save items for later" value={data.newFeatureRequirement || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Explain exactly what you want to build and how it should work.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="constraints">Constraints (Optional)</Label>
          <Input id="constraints" name="constraints" placeholder="e.g., Must be accessible, load under 1s" value={data.constraints || ''} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">Mention any performance, design, or architectural limitations.</p>
        </div>
      </div>
    );
  }

  if (mode === 'bugfix') {
    const data = formData as Partial<BugFixPromptData>;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectDescription">Project Description <span className="text-destructive">*</span></Label>
          <Textarea id="projectDescription" name="projectDescription" placeholder="e.g., A real-time chat application" value={data.projectDescription || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Briefly explain the context of the application.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="techStack">Tech Stack <span className="text-destructive">*</span></Label>
          <Input id="techStack" name="techStack" placeholder="e.g., React, Firebase, Tailwind" value={data.techStack || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">List the relevant technologies involved in the bug.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bugDescription">Bug Description <span className="text-destructive">*</span></Label>
          <Textarea id="bugDescription" name="bugDescription" placeholder="e.g., Messages are duplicating when sent rapidly" value={data.bugDescription || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Explain what is going wrong and how to reproduce it.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="errorLogs">Error Message / Logs</Label>
          <Textarea id="errorLogs" name="errorLogs" placeholder="Paste any console errors or stack traces here" className="font-mono text-sm" value={data.errorLogs || ''} onChange={handleChange} />
          <p className="text-xs text-muted-foreground">Provide the exact error output from your console or terminal.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedBehavior">Expected Behavior <span className="text-destructive">*</span></Label>
          <Textarea id="expectedBehavior" name="expectedBehavior" placeholder="e.g., Only one message should appear in the chat list per send action" value={data.expectedBehavior || ''} onChange={handleChange} required />
          <p className="text-xs text-muted-foreground">Describe what should happen when the code works correctly.</p>
        </div>
      </div>
    );
  }

  return null;
}
