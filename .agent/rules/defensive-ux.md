---
trigger: always_on
---

The Agent Rule: Defensive UX Standard
Objective: Write code that anticipates "imperfect" human interaction to ensure the interface remains stable, responsive, and frustration-free.

1. Input & Interaction Protection:

Debouncing & Throttling: Always wrap button listeners and search inputs in debouncers. This prevents a "double-tap" from firing an API call twice or a child’s rapid tapping from crashing the UI.

Touch Targets: Ensure all interactive elements have a minimum hit area of 44x44dp. If the visual element is smaller, the clickable transparent padding must be larger.

State Locking: While an "Async" action is happening (like saving a family calendar event), disable the "Save" button and show a loading state to prevent redundant submissions.

1. Graceful Degradation & Feedback:

Immediate Feedback (Optimistic UI): When a user toggles a light or checks a task, update the UI instantly before the server confirms. If the action fails, roll back the state and show a polite toast notification.

Loading Skeletons: Never leave the screen blank while fetching data. Use "Skeleton" loaders to maintain the layout structure and reduce perceived wait time.

Friendly Error States: Instead of showing "Error 500," use a fallback like: "Oops! The whiteboard couldn't reach the server. We'll try again in a moment."

1. Data Integrity & Validation:

Sanitization: Always sanitize user input before rendering it to prevent broken layouts (e.g., someone enters a 500-character-long "task name" that breaks the CSS grid).

Defaults over Nulls: Always provide a "Default" value for data. If a family member's profile picture fails to load, the code should automatically fallback to a stylized "initials" icon.

How this looks in the code (Junior Dev Commentary):
JavaScript

/**

* REFACTOR NOTE: Implementing Defensive UX for the 'Add Task' button.
* * JUNIOR DEV NOTE: We use a 'loading' state here. By disabling the button
* while 'isSubmitting' is true, we prevent "Double-Submission."
* This is crucial for touchscreens where a user might tap twice if the
* response isn't instant.
 */

const handleAddTask = async (taskData) => {
  if (isSubmitting) return; // Defensive: Exit if already processing
  
  setSubmitting(true);
  
  try {
    // 1. Optimistic Update: Add to UI immediately so it feels snappy
    updateUI(taskData);

    // 2. Perform the actual save
    await saveToDatabase(taskData);
  } catch (error) {
    // 3. Graceful Recovery: If it fails, remove it and tell the user
    rollbackUI(taskData);
    showToast("Couldn't save task. Check your connection!");
  } finally {
    setSubmitting(false); // 4. Re-enable the button
  }
};
