# Setup ECS with Load Balancer for Fragments Service
# This script creates the complete infrastructure needed for Lab 10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up ECS with Load Balancer" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Create ECS Cluster
Write-Host "1. Creating ECS cluster 'fragments'..." -ForegroundColor Yellow
aws ecs create-cluster --cluster-name fragments --region us-east-1
Write-Host "Cluster created`n" -ForegroundColor Green

# 2. Get default VPC and subnets
Write-Host "2. Getting VPC and subnets..." -ForegroundColor Yellow
$vpcId = (aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region us-east-1)
Write-Host "   VPC ID: $vpcId" -ForegroundColor White

$subnets = (aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpcId" --query "Subnets[*].SubnetId" --output text --region us-east-1)
$subnetArray = $subnets -split '\s+'
Write-Host "   Subnets: $($subnetArray -join ', ')" -ForegroundColor White
Write-Host "VPC info retrieved`n" -ForegroundColor Green

# 3. Create security group for Load Balancer
Write-Host "3. Creating security group for Load Balancer..." -ForegroundColor Yellow
$lbSgId = (aws ec2 create-security-group `
    --group-name fragments-lb-sg `
    --description "Security group for fragments load balancer" `
    --vpc-id $vpcId `
    --query "GroupId" `
    --output text `
    --region us-east-1)
Write-Host "   LB Security Group ID: $lbSgId" -ForegroundColor White

# Allow HTTP traffic on port 80
aws ec2 authorize-security-group-ingress `
    --group-id $lbSgId `
    --protocol tcp `
    --port 80 `
    --cidr 0.0.0.0/0 `
    --region us-east-1
Write-Host "LB security group created`n" -ForegroundColor Green

# 4. Create security group for ECS tasks
Write-Host "4. Creating security group for ECS tasks..." -ForegroundColor Yellow
$taskSgId = (aws ec2 create-security-group `
    --group-name fragments-task-sg `
    --description "Security group for fragments ECS tasks" `
    --vpc-id $vpcId `
    --query "GroupId" `
    --output text `
    --region us-east-1)
Write-Host "   Task Security Group ID: $taskSgId" -ForegroundColor White

# Allow traffic from load balancer on port 8080
aws ec2 authorize-security-group-ingress `
    --group-id $taskSgId `
    --protocol tcp `
    --port 8080 `
    --source-group $lbSgId `
    --region us-east-1
Write-Host "Task security group created`n" -ForegroundColor Green

# 5. Create Application Load Balancer
Write-Host "5. Creating Application Load Balancer..." -ForegroundColor Yellow
$lbArn = (aws elbv2 create-load-balancer `
    --name fragments-lb `
    --subnets $subnetArray[0] $subnetArray[1] `
    --security-groups $lbSgId `
    --scheme internet-facing `
    --type application `
    --ip-address-type ipv4 `
    --query "LoadBalancers[0].LoadBalancerArn" `
    --output text `
    --region us-east-1)
Write-Host "   Load Balancer ARN: $lbArn" -ForegroundColor White

# Get Load Balancer DNS name
$lbDns = (aws elbv2 describe-load-balancers `
    --load-balancer-arns $lbArn `
    --query "LoadBalancers[0].DNSName" `
    --output text `
    --region us-east-1)
Write-Host "   Load Balancer DNS: $lbDns" -ForegroundColor Cyan
Write-Host "Load Balancer created`n" -ForegroundColor Green

# 6. Create Target Group
Write-Host "6. Creating Target Group..." -ForegroundColor Yellow
$tgArn = (aws elbv2 create-target-group `
    --name fragments-tg `
    --protocol HTTP `
    --port 8080 `
    --vpc-id $vpcId `
    --target-type ip `
    --health-check-path "/health" `
    --health-check-interval-seconds 30 `
    --health-check-timeout-seconds 5 `
    --healthy-threshold-count 2 `
    --unhealthy-threshold-count 3 `
    --query "TargetGroups[0].TargetGroupArn" `
    --output text `
    --region us-east-1)
Write-Host "   Target Group ARN: $tgArn" -ForegroundColor White
Write-Host "Target Group created`n" -ForegroundColor Green

# 7. Create Listener
Write-Host "7. Creating Load Balancer Listener..." -ForegroundColor Yellow
aws elbv2 create-listener `
    --load-balancer-arn $lbArn `
    --protocol HTTP `
    --port 80 `
    --default-actions Type=forward,TargetGroupArn=$tgArn `
    --region us-east-1
Write-Host "Listener created`n" -ForegroundColor Green

# 8. Register Task Definition
Write-Host "8. Registering ECS Task Definition..." -ForegroundColor Yellow
aws ecs register-task-definition `
    --cli-input-json file://fragments-definition.json `
    --region us-east-1
Write-Host "Task Definition registered`n" -ForegroundColor Green

# 9. Create ECS Service with Load Balancer
Write-Host "9. Creating ECS Service..." -ForegroundColor Yellow
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
      "securityGroups": ["$taskSgId"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "$tgArn",
      "containerName": "fragments",
      "containerPort": 8080
    }
  ]
}
"@

$serviceJson | Out-File -FilePath "service-config.json" -Encoding utf8
aws ecs create-service --cli-input-json file://service-config.json --region us-east-1
Write-Host "ECS Service created`n" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Your Load Balancer URL:" -ForegroundColor Yellow
Write-Host "http://$lbDns`n" -ForegroundColor Cyan

Write-Host "IMPORTANT: Wait 2-3 minutes for the service to start and become healthy.`n" -ForegroundColor Yellow

Write-Host "To check service status:" -ForegroundColor White
Write-Host "aws ecs describe-services --cluster fragments --services fragments --region us-east-1`n" -ForegroundColor Gray

Write-Host "To test your service:" -ForegroundColor White
Write-Host "curl http://$lbDns/health`n" -ForegroundColor Gray

Write-Host "Save this URL for your fragments-ui configuration!" -ForegroundColor Yellow
