# Global AWS Deployment

This is just me having fun in AWS. `script.sh` will will loop over all the 
regions I care about and deploy `template.json` to it. The template contains a
basic serverless applcation.

For this to work you also need to have a global DynamoDB table setup in all of 
the specified regions.

I would have used a StackSet to do this, but StackSets are more geared towards
multi-account CloudFormation management in an organization. I don't have an
organization/OUs setup on AWS nor multiple accounts.
