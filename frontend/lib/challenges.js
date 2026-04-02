const challenges = [
  {
    id: "counter-button",
    title: "Interactive Counter",
    difficulty: "Easy",
    shortDescription: "Build a standard interactive counter using React hooks.",
    description: `### Task: Simple React Counter\n\nCreate a functional counter button using React's useState hook. The button should display the current count and increment by 1 each time it is clicked.\n\n### Requirements:\n1. Initialize count at 0\n2. Update the button text to show: "Current Count: {count}"\n3. The count must increment by exactly 1 per click`,
    starterCode: `import React, { useState } from 'react';

/**
 * Task: Implement a counter that increments on click.
 * Use React.useState().
 */
export default function Counter() {
    // WRITE YOUR CODE HERE
    return (
        <button id="counter-btn" style={{ padding: '12px 24px', borderRadius: '8px', background: '#4F46E5', color: 'white', border: 'none', cursor: 'pointer' }}>
            Count: 0
        </button>
    );
}`,
    constraints: [
      "Must use React hooks",
      "Must be functional component",
      "Should not use external libraries for state",
    ],
    hints: [
      "Import { useState } from 'react'",
      "Call useState(0) to initialize state",
      "Add an onClick handler to the button",
    ],
  },
  {
    id: "todo-list",
    title: "Dynamic Todo List",
    difficulty: "Medium",
    shortDescription:
      "Implement a list where users can add and remove items dynamically.",
    description: `### Task: Dynamic Todo List\n\nBuild a basic Todo list application where users can input text into a field and add it to a list. Each item should have a "Delete" button that removes it from the list.\n\n### Requirements:\n1. Controlled input field for new tasks\n2. "Add" button to append task to list\n3. Map over tasks to render them\n4. Remove individual tasks via a delete button`,
    starterCode: `import React, { useState } from 'react';

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const addTask = () => {
        if (!inputValue) return;
        setTasks([...tasks, inputValue]);
        setInputValue('');
    };

    const removeTask = (index) => {
        setTasks(tasks.filter((_, idx) => idx !== index));
    };

    return (
        <div style={{ padding: '20px' }}>
            <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '8px' }}
            />
            <button onClick={addTask} style={{ marginLeft: '10px' }}>Add</button>
            <ul>
                {tasks.map((task, i) => (
                    <li key={i}>
                        {task} <button onClick={() => removeTask(i)}>X</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}`,
    constraints: [
      "Items must be unique-ish (index is fine for basic)",
      "State must be handled in React",
    ],
    hints: [
      "Use an array for state",
      "Use .filter() for removal",
      "Prevent adding empty strings",
    ],
  },
  {
    id: "css-layout-ninja",
    title: "CSS Layout Ninja",
    difficulty: "Hard",
    shortDescription:
      "Replicate a complex grid-based dashboard layout using pure CSS.",
    description: `### Task: Grid-Based Dashboard\n\nYour task is to create a responsive dashboard layout using CSS Grid and Flexbox. \n\n### Requirements:\n1. A sidebar that takes 25% width on desktop and hides on mobile.\n2. A main content area with at least 4 cards.\n3. A header that sticks to the top.\n4. Use Tailwind CSS classes if possible, or inline styles for this sandbox.`,
    starterCode: `import React from 'react';

export default function Dashboard() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', height: '100vh', background: '#0f172a' }}>
            <aside style={{ background: '#1e293b', borderRight: '1px solid #334155', padding: '16px' }}>
                <h3 style={{ color: '#94a3b8' }}>Sidebar</h3>
            </aside>
            <main style={{ padding: '24px' }}>
                <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <h1 style={{ color: '#fff' }}>Overview</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4F46E5' }}></div>
                    </div>
                </header>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                   {/* Add your cards here */}
                   <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}>
                        Card 1
                   </div>
                </div>
            </main>
        </div>
    );
}`,
    constraints: ["Must be responsive", "No external grid libraries"],
    hints: [
      "Use display: grid",
      "Use media queries via @media or responsive utilities",
    ],
  },
];

export default challenges;
