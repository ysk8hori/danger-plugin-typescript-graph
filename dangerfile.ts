import { danger, warn } from 'danger';
import typescriptGraph from './src/index';

// No PR is too small to include a description of why you made a change
if (danger.github.pr.body.length < 10) {
  warn('Please include a description of your PR changes.');
}

// Request changes to src also include changes to tests.
const allFiles = danger.git.modified_files.concat(danger.git.created_files);
const hasAppChanges = allFiles.some(p => p.includes('src/'));
const hasTestChanges = allFiles.some(p => p.includes('__tests__/'));

if (hasAppChanges && !hasTestChanges) {
  warn(
    'This PR does not include changes to tests, even though it affects app code.',
  );
}

(async () => {
  console.log('TSG START');
  await typescriptGraph();
  console.log('TSG END');
})();
