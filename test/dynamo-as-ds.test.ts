import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DynamoAsDs from '../lib/dynamo-as-ds-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DynamoAsDs.DynamoAsDsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
