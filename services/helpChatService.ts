// This is a mock AI service for the Help Chatbot.
// It simulates an API call and provides canned responses based on keywords.

export const getHelpResponse = (query: string): Promise<string> => {
  const lcQuery = query.toLowerCase();

  return new Promise(resolve => {
    setTimeout(() => {
      if (lcQuery.includes('connect')) {
        resolve("To connect nodes, click and drag from the small circle (handle) on the right side of one node to the handle on the left side of another node.");
      } else if (lcQuery.includes('save')) {
        resolve("You can save your workflow by clicking the 'Save' button in the toolbar at the top. You must be signed in to save.");
      } else if (lcQuery.includes('run') || lcQuery.includes('execute')) {
        resolve("To run a workflow, click the 'Run' button in the toolbar. Make sure all your nodes are connected properly before running!");
      } else if (lcQuery.includes('dark mode')) {
        resolve("You can toggle dark mode by clicking the sun/moon icon in the toolbar.");
      } else if (lcQuery.includes('add') || lcQuery.includes('node')) {
        resolve("To add a new node to the canvas, simply drag it from the 'Nodes' panel on the left and drop it onto the workspace.");
      } else if (lcQuery.includes('delete')) {
        resolve("To delete a node or an edge, select it by clicking on it, and then press the 'Delete' or 'Backspace' key on your keyboard.");
      } else if (lcQuery.includes('what') && lcQuery.includes('this')) {
        resolve("This is an AI Workflow Builder! You can create, visualize, and run complex AI tasks by connecting different nodes together on the canvas.");
      } else if (lcQuery.includes('help')) {
        resolve("Of course! How can I assist you? You can ask me about connecting nodes, running workflows, saving, or adding nodes.");
      } else {
        resolve("I'm sorry, I'm not sure how to answer that. Try asking about how to 'connect nodes', 'run a workflow', or 'save your progress'.");
      }
    }, 800); // Simulate network delay
  });
};