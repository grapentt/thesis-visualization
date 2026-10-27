// LLMs beyond the chat window: how LLMs become parts of security workflows, and
// the project "Triaging Security Alerts with a Local LLM".
// The edit: which scenes play, in which order.

import meta from './meta.json' with { type: 'json' };

import title from './scenes/00-title.js';
import nextToken from './scenes/01-next-token.js';
import underTheChat from './scenes/02-under-the-chat.js';
import python from './scenes/03-python.js';
import loop from './scenes/04-loop.js';
import structured from './scenes/05-structured.js';
import context from './scenes/06-context.js';
import grounding from './scenes/07-grounding.js';
import securityUses from './scenes/08-security-uses.js';
import risks from './scenes/09-risks.js';
import project from './scenes/10-project.js';
import socProblem from './scenes/11-soc-problem.js';
import lab from './scenes/12-lab.js';
import alert from './scenes/13-alert.js';
import pipeline from './scenes/14-pipeline.js';
import loki from './scenes/15-loki.js';
import fleet from './scenes/16-fleet.js';
import prompt from './scenes/17-prompt.js';
import attack from './scenes/18-attack.js';
import explanation from './scenes/19-explanation.js';
import groundTruth from './scenes/20-ground-truth.js';
import metrics from './scenes/21-metrics.js';
import research from './scenes/22-research.js';
import summary from './scenes/23-summary.js';

const scenes = [
  title,
  nextToken,
  underTheChat,
  python,
  loop,
  structured,
  context,
  grounding,
  securityUses,
  risks,
  project,
  socProblem,
  lab,
  alert,
  pipeline,
  loki,
  fleet,
  prompt,
  attack,
  explanation,
  groundTruth,
  metrics,
  research,
  summary,
];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 7,
};
