# Environment variables from process into Angular app

Angular already has his own environment system, can configure everything in src/environments/environment.ts 
and you can create as many environments as you want. 
The problem is, sometimes you want to use the System Environment variables, 
for example, some configuration from the CI server or if build process is running "on-premise" server, 
in this case, Angular environment system will not help.

**ng-process-env** will help you to retrieve values from System Environment variables and update relevant `environment.ts` file.


### Installing
Just add it into your app.

```bash
ng add ng-process-env
```

You will be prompted to insert relevant project name project name.  
You can skip it and use schematics generator later by running: 

```bash
ng g ng-process-env:process-env
```

Insert project name 
```bash
? Project name to update angular.json config. 
(you can skip and do it later using schematics or manually) my-app
 Project my-app will be updated
    Env File will be created at apps/my-app/src/environments
```

#Collect Vars

To update the created environment ts file with variables from process.env:
```bash
ng run my-app:collect-vars
```


#More details

Navigate to `apps/my-app/src/environments` 
Open a new created file `environment.onprem.ts`  
Should looks similar to: 

```typescript
export const environment = {
  production: false,
  envVar: {
    /**
     * Add environment variables you want to retrieve from process
     * PORT:4200,
     * VAR_NAME: defaultValue
     */
  }
};
```

Add variable names you want to be retrieved from `process.env`.  
We suggest you to add default values too. 

## Example

_environment.onprem.ts_

```typescript
export const environment = {
  production: false,
  envVar: {
    API_URL: 'http://localhost:3000',
    servePort: 4200,
    customer_id: '700',
    otherKey: 'defaultValue'
  }
};
```

### Collect vars 

To update _environment.onprem.ts_ with variables from environment run:

```shell script
ng run my-app:collect-vars
```

Updated _environment.onprem.ts_.
```typescript
export const environment = {
    production: false,
    envVar: {
        otherKey: 'defaultValue',
        API_URL: "api.domain.com",
        servePort: 5000 as number,
        customer_id: "1234"
    }
};
```

| environment.onprem.ts           | Type   | exported value   (process.env[someKey])| Will be changed with       |
|---------------------------------|--------|--------------------------------------|------------------------------|
| `API_URL: 'localhost:3000'`     | string | 'api.domain.com'                     | `API_URL: 'api.domain.com'`  |
| `servePort: 4200`               | number | 5000                                 | `servePort: 5000 as number`  |
| `customer_id: '700'`            | string | 1234                                 | `customer_id: '1234'`        |
| `otherKey: 'defaultValue'`      | string | _null or undefined_                  | `otherKey: 'defaultValue'`   |


