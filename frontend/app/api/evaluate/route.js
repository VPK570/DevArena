import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code, challengeId } = await request.json();

    // Mock evaluation logic for different challenges
    let score = 0;
    let verdict = "Fail";
    let summary = "The code does not meet the requirements or has critical errors.";
    let feedback = [];

    // Simulate "Checking"
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (challengeId === 'counter-button') {
      if (code.includes('useState(0)') && code.includes('onClick') && code.includes('++')) {
        score = 100;
        verdict = "Pass";
        summary = "Perfect implementation! You correctly handled the React state lifecycle and incremented the counter correctly.";
      } else if (code.includes('useState')) {
        score = 65;
        verdict = "Partial";
        summary = "Good start, but you're missing the final increment logic or the display format is slightly off.";
        feedback = [
          { line: 7, issue: "Missing increment operator.", fix: "Use setCount(prev => prev + 1) for the best performance." }
        ];
      } else {
        score = 10;
        verdict = "Fail";
        summary = "No state management detected. Use React's functional hooks for state.";
        feedback = [
          { line: 1, issue: "React hooks are required.", fix: "Import { useState } from 'react'." }
        ];
      }
    } else if (challengeId === 'todo-list') {
      if (code.includes('tasks.map') && code.includes('.filter')) {
        score = 95;
        verdict = "Pass";
        summary = "Excellent logic. The map/filter combo is the classic React approach for dynamic lists.";
      } else {
        score = 50;
        verdict = "Partial";
        summary = "The UI renders, but the deletion logic or input clearing might be broken.";
        feedback = [
          { line: 14, issue: "No key prop in list items.", fix: "Use 'key={i}' on your li tag." }
        ];
      }
    } else {
      // Default / Catch-all
      score = 85;
      verdict = "Pass";
      summary = "Code looks solid, though some edge cases might not be handled.";
    }

    return NextResponse.json({
      score,
      verdict,
      summary,
      feedback
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}
