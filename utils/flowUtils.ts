
// NOTE: You need to install `html-to-image` for PNG export to work.
// npm install html-to-image
import { toPng } from 'html-to-image';
import { type Workflow } from '../types';

export const exportToJson = (flow: Workflow) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(flow, null, 2)
  )}`;
  const link = document.createElement('a');
  link.href = jsonString;
  link.download = 'workflow.json';
  link.click();
};

export const exportToPng = () => {
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) {
    console.error('React Flow viewport not found for PNG export.');
    return;
  }
  toPng(viewport, { cacheBust: true })
    .then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'workflow.png';
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.error('Failed to export PNG:', err);
    });
};