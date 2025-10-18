#!/usr/bin/env node

import { Command } from 'commander';
import { reviewMergeRequest } from './index';
import { Logger } from './utils/logger';
import { getReviewMetadata } from './utils/network';

const program = new Command();

program
  .name('reviewbot')
  .description('AI-powered code review bot for GitLab merge requests')
  .version('1.0.0');

program
  .command('review')
  .description('Review a GitLab merge request')
  .requiredOption('-u, --url <url>', 'GitLab merge request URL')
  .option('-p, --post', 'Post the review as a comment on the MR', false)
  .option('-f, --format <format>', 'Output format: text or json', 'text')
  .action(async (options) => {
    try {
      const result = await reviewMergeRequest({
        mrUrl: options.url,
        postComment: options.post,
        outputFormat: options.format,
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // Text format output
        console.log('\n' + '='.repeat(80));
        console.log('AI CODE REVIEW RESULTS');
        console.log('='.repeat(80) + '\n');

        console.log('SUMMARY:');
        console.log(result.summary);
        console.log('');

        if (result.comments.length > 0) {
          console.log('DETAILED FEEDBACK:');
          console.log('-'.repeat(80));
          for (const comment of result.comments) {
            const location = comment.lineNumber
              ? `${comment.filePath}:${comment.lineNumber}`
              : comment.filePath;
            console.log(`[${comment.severity.toUpperCase()}] ${location}`);
            console.log(`  ${comment.comment}`);
            console.log('');
          }
        }

        console.log('OVERALL ASSESSMENT:');
        console.log(result.overallAssessment);
        console.log('\n' + '-'.repeat(80));
        console.log(getReviewMetadata());
        console.log('='.repeat(80) + '\n');

        if (options.post) {
          Logger.success('Review has been posted as a comment on the merge request');
        }
      }
    } catch (error: any) {
      Logger.error('Failed to complete review', error);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
