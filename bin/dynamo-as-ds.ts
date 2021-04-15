#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DynamoAsDsStack } from '../lib/dynamo-as-ds-stack';

const app = new cdk.App();
new DynamoAsDsStack(app, 'DynamoAsDsStack');
