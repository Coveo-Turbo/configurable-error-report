# ConfigurableErrorReport

The Configurable Error Report provides an alternative to the out of the box [`ErrorReport`](https://coveo.github.io/search-ui/components/errorreport.html) component to permit the use of custom titles or HTML on the error message in the place of the defaults that come with the JSUI framework.

Disclaimer: This component was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/configurable-error-report
```

2. Use the Component or extend it

Typescript:

```javascript
import { ConfigurableErrorReport, IConfigurableErrorReportOptions } from '@coveops/configurable-error-report';
```

Javascript

```javascript
const ConfigurableErrorReport = require('@coveops/configurable-error-report').ConfigurableErrorReport;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/configurable-error-report'
```

4. Or for quick testing, you can add the script from unpkg

```html
<script src="https://unpkg.com/@coveops/configurable-error-report@latest/dist/index.min.js"></script>
```

> Disclaimer: Unpkg should be used for testing but not for production.

5. Include the component in your template as follows:

Place the component in your markup:

```html
<div class="CoveoConfigurableErrorReport"></div>
```

## Options

The following options can be configured:

| Option | Required | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `showDetailedError` | No | boolean | `true` | Specifies whether to display a detailed error message as a JSON in a text content area. Reference: https://coveo.github.io/search-ui/components/errorreport.html |
| `defaultErrorTitle` | No | string | `l('OopsError')` | Sets the translatable title to use when an error message is not already handled. The option also supports HTML and the final result will be rendered as HTML within an `h1` tag. |
| `defaultHelpSuggestion` | No | string | `l('ProblemPersists')` | Sets the translatable help suggestion to use when an error message is not already handled. The option also supports HTML and the final result will be rendered as HTML within an `h2` tag. |

## Extending

Extending the component can be done as follows:

```javascript
import { ConfigurableErrorReport, IConfigurableErrorReportOptions } from "@coveops/configurable-error-report";

export interface IExtendedConfigurableErrorReportOptions extends IConfigurableErrorReportOptions {}

export class ExtendedConfigurableErrorReport extends ConfigurableErrorReport {}
```

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`