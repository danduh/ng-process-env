# Environment variables from process into Angular app


### Installing
Just add it into your app.

```bash
ng add ng-process-env
```

You will be prompted to insert relevant project name project name.  
You can skip it and use schematics generator later. 

Use schematics to update relevant project.

```bash
ng shematic:ng-process-env
```

Insert project name 
```bash
? Project name to update angular.json config. (you can skip and do it later using schematics or manually) my-app
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
End open new created file `environment.onprem.ts`  
Should looks similar to: 

```angular2
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
```angular2
export const environment = {
  production: false,
  envVar: {
    API_URL: 'http://localhost:3000'
  }
};
```
