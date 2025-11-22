# Create ECS Cluster
Write-Host "Creating ECS cluster 'fragments'..." -ForegroundColor Cyan
aws ecs create-cluster --cluster-name fragments --region us-east-1

# Get default VPC ID
Write-Host "`nGetting default VPC..." -ForegroundColor Cyan
$vpcId = (aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region us-east-1)
Write-Host "VPC ID: $vpcId"

# Get subnets
Write-Host "`nGetting subnets..." -ForegroundColor Cyan
$subnets = (aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpcId" --query "Subnets[*].SubnetId" --output text --region us-east-1)
$subnetArray = $subnets -split '\s+'
Write-Host "Subnets: $($subnetArray -join ', ')"

# Create security group
Write-Host "`nCreating security group..." -ForegroundColor Cyan
$sgId = (aws ec2 create-security-group `
    --group-name fragments-sg `
    --description "Security group for fragments service" `
    --vpc-id $vpcId `
    --query "GroupId" `
    --output text `
    --region us-east-1)
Write-Host "Security Group ID: $sgId"

# Add inbound rule for port 8080
Write-Host "`nAdding inbound rule for port 8080..." -ForegroundColor Cyan
aws ec2 authorize-security-group-ingress `
    --group-id $sgId `
    --protocol tcp `
    --port 8080 `
    --cidr 0.0.0.0/0 `
    --region us-east-1

# Register task definition
Write-Host "`nRegistering task definition..." -ForegroundColor Cyan
aws ecs register-task-definition `
    --cli-input-json file://fragments-definition.json `
    --region us-east-1

# Create ECS service
Write-Host "`nCreating ECS service..." -ForegroundColor Cyan
$serviceJson = @"
{
  "cluster": "fragments",
  "serviceName": "fragments",
  "taskDefinition": "fragments",
  "desiredCount": 1,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["$($subnetArray[0])", "$($subnetArray[1])"],
      "securityGroups": ["$sgId"],
      "assignPublicIp": "ENABLED"
    }
  }
}
"@

$serviceJson | Out-File -FilePath "service-config.json" -Encoding utf8
aws ecs create-service --cli-input-json file://service-config.json --region us-east-1

Write-Host "`n✅ ECS infrastructure created successfully!" -ForegroundColor Green
Write-Host "`nTo get the public IP of your service, run:" -ForegroundColor Yellow
Write-Host "aws ecs list-tasks --cluster fragments --region us-east-1" -ForegroundColor White
