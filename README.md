Serverless Parent Plugin 
==========================
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-plugin-parent.svg)](https://badge.fury.io/js/serverless-plugin-parent)
[![npm downloads](https://img.shields.io/npm/dm/serverless-plugin-parent.svg)](https://www.npmjs.com/package/serverless-plugin-parent)
[![license](https://img.shields.io/npm/l/serverless-plugin-parent.svg)](https://raw.githubusercontent.com/aronim/serverless-plugin-parent/master/LICENSE)

Share common configuration between services

**Requirements:**
* Serverless *v1.12.x* or higher.
* AWS provider

## How it works

Serverless Plugin that allows you to keep common configuration in a parent serverless.yml  

### Setup

 Install via npm in the root of your Serverless service:
```
npm install serverless-plugin-parent --save-dev
```

* Add the plugin to the `plugins` array in your Serverless `serverless.yml`:

```yml
plugins:
  - serverless-plugin-parent
```

### Default Usage - Discover Serverless.yml
The plugin will recursively search all parent directories for a serverless.yml file until it reaches the user's 
home direcory or has gone `x` number of directories up. The default value is 3 but this can be configured using
```yaml
custom:
  parent:
    maxLevels: 2     # Optional (Default 3)
```  

##### Project Structure

```
<project_root>
- service1
  - hello.js
  - serverless.yml
- service2
  - goodbye.js
  - serverless.yml
- serverless.yml

```
##### serverless.yml
```yaml
provider:
  name: aws
  stage: ${opt:stage, "Test"}
  runtime: nodejs8.10
  role: DefaultRole

resources:
  Resources:
    DefaultRole:
      Type: AWS::IAM::Role
      Properties:
        Path: /
        RoleName: ${self:service}-${self:provider.stage}
        AssumeRolePolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Principal:
                Service:
                  - lambda.amazonaws.com
              Action: sts:AssumeRole
        Policies:
          - PolicyName: ${self:service}-${self:provider.stage}
            PolicyDocument:
              Version: "2012-10-17"
              Statement:
                - Effect: Allow
                  Action:
                    - logs:CreateLogGroup
                    - logs:CreateLogStream
                    - logs:PutLogEvents
                  Resource: arn:aws:logs:${self:provider.region}:*:log-group:/aws/lambda/*:*:*
```

##### service1/serverless.yml
```yaml
service: Service1

plugins:
  - serverless-plugin-parent

provider:
  environment:
    HELLO_MESSAGE: Mholo

functions:
  Hello:
    handler: hello.handle
    events:
      - http:
          path: hello
          method: get
          cors: true
```

##### Effective serverless.yml
```yaml

service: Service1

provider:
  name: aws
  stage: ${opt:stage, "Test"}
  runtime: nodejs8.10
  role: DefaultRole

plugins:
  - serverless-plugin-parent

provider:
  environment:
    HELLO_MESSAGE: Mholo

functions:
  Hello:
    handler: hello.handle
    events:
      - http:
          path: hello
          method: get
          cors: true

resources:
  Resources:
    DefaultRole:
      Type: AWS::IAM::Role
      Properties:
        Path: /
        RoleName: ${self:service}-${self:provider.stage}
        AssumeRolePolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Principal:
                Service:
                  - lambda.amazonaws.com
              Action: sts:AssumeRole
        Policies:
          - PolicyName: ${self:service}-${self:provider.stage}
            PolicyDocument:
              Version: "2012-10-17"
              Statement:
                - Effect: Allow
                  Action:
                    - logs:CreateLogGroup
                    - logs:CreateLogStream
                    - logs:PutLogEvents
                  Resource: arn:aws:logs:${self:provider.region}:*:log-group:/aws/lambda/*:*:*
```

### Alternate Usage - Defined parent configuration path 

##### Project Structure

```
<project_root>
- parent
  - serverless.yml
- service1
  - hello.js
  - serverless.yml
- service2
  - goodbye.js
  - serverless.yml
```

##### service1/serverless.yml
```yaml
custom:
  parent:
    path: ../parent
    # or 
    path: ../parent/serverless.yml
```

## Contribute

Help us making this plugin better and future proof.

* Clone the code
* Install the dependencies with `npm install`
* Create a feature branch `git checkout -b new_feature`
* Lint with standard `npm run lint`

## License

This software is released under the MIT license. See [the license file](LICENSE) for more details.
