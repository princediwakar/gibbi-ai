# Copilot Instructions

## General Guidelines

- **Full Code Solutions**: Provide complete, functional code that can be directly copied and pasted
- **Context Awareness**: Use provided code/context or state assumptions clearly
- **Reliability**: Ensure code is syntactically correct and follows project stack (Next.js, TypeScript, Supabase)
- **Explanatory Detail**: Include clear explanations and integration notes
- **Structured Format**: Follow consistent response structure

## Response Structure

### 1. Problem Summary
- State the task/problem being addressed
- Reference any relevant user code or context

### 2. Code Solution
- Use language-specific markdown code blocks (```tsx)
- Include file paths for all code changes
- Add comments for complex logic

```typescript
// Example code block format
// filepath: /path/to/file
export function Example() {
  // Add explanatory comments for complex logic
  return <div>Example component</div>
}
```

### 3. Implementation Details
- Explain key code sections and changes
- Describe the solution approach
- List any assumptions or dependencies
- Note any type definitions or interfaces needed

### 4. Integration Steps
- Provide clear installation/setup steps if needed
- List any new dependencies to install
- Explain where code should be placed

### 5. Verification
- Provide specific testing steps
- Note expected behavior
- Mention any edge cases to check

## Coding Standards

### Style Guidelines
- Match existing project patterns
- Use TypeScript for type safety
- Follow React/Next.js best practices
- Implement responsive Tailwind CSS

### Best Practices
- Write modular, reusable code
- Use proper TypeScript types/interfaces
- Leverage modern React features (hooks, server components)
- Follow accessibility guidelines
- Include error handling