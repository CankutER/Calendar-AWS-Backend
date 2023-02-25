#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CalendarBackendStack } from "../lib/calendar-backend-stack";

const app = new cdk.App();
new CalendarBackendStack(app, "CalendarBackendStack", {
  stackName: "CalendarStack",
});
