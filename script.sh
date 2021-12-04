DEPLOYMENT=$(openssl rand -hex 12)

zip -r ${DEPLOYMENT}.zip .

for REGION in eu-west-1 us-east-1 us-west-2 ap-northeast-1 ap-southeast-1 ap-southeast-2 ap-south-1 sa-east-1; do
  aws s3 cp ${DEPLOYMENT}.zip s3://jpb-blog-${REGION}-artifacts/
done

for REGION in eu-west-1 us-east-1 us-west-2 ap-northeast-1 ap-southeast-1 ap-southeast-2 ap-south-1 sa-east-1; do
  aws cloudformation create-stack --stack-name jpb-blog-api-${REGION} --template-body file://template.json --parameters ParameterKey=S3Key,ParameterValue=${DEPLOYMENT}.zip --region ${REGION} --capabilities CAPABILITY_IAM
done

# https://console.aws.amazon.com/cloudformation/home?region=eu-west-1
# https://console.aws.amazon.com/cloudformation/home?region=us-east-1
# https://console.aws.amazon.com/cloudformation/home?region=us-west-2
# https://console.aws.amazon.com/cloudformation/home?region=ap-northeast-1
# https://console.aws.amazon.com/cloudformation/home?region=ap-southeast-1
# https://console.aws.amazon.com/cloudformation/home?region=ap-southeast-2
# https://console.aws.amazon.com/cloudformation/home?region=ap-south-1
# https://console.aws.amazon.com/cloudformation/home?region=sa-east-1
