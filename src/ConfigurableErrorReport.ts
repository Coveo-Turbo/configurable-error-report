import {
    Component,
    IComponentBindings,
    ComponentOptions,
    QueryEvents,
    IQueryErrorEventArgs,
    Assert,
    IEndpointError,
    MissingAuthenticationError,
    Dom,
    $$,
    IErrorReportOptions,
    l,
    IAnalyticsNoMeta,
    analyticsActionCauseList,
} from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';
import { AccessibleButton } from './utils';

export interface IConfigurableErrorReportOptions extends IErrorReportOptions { 
    defaultErrorTitle: string,
    defaultHelpSuggestion: string,
}

@lazyComponent
export class ConfigurableErrorReport extends Component {
    static ID = 'ConfigurableErrorReport';
    static options: IConfigurableErrorReportOptions = {
        showDetailedError: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        defaultErrorTitle: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'OopsError' }),
        defaultHelpSuggestion: ComponentOptions.buildLocalizedStringOption({ defaultValue: 'ProblemPersists' }),
    };

    protected organizationId;
    protected message: Dom;
    protected container: Dom;
    protected helpSuggestion: Dom;
    protected closePopup: () => void;

    constructor(public element: HTMLElement, public options: IConfigurableErrorReportOptions, public bindings: IComponentBindings) {
        super(element, ConfigurableErrorReport.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, ConfigurableErrorReport, options);
        this.container = $$('div', { className: 'coveo-error-report-container' });
        this.element.appendChild(this.container.el);

        if (this.options.showDetailedError) {
            this.message = $$('div', {
                className: 'coveo-error-report-message'
            });

            this.container.append(this.message.el);
        }

        this.helpSuggestion = $$('div', {
            className: 'coveo-error-report-help-suggestion'
        });

        $$(this.element).hide();

        this.bind.onRootElement(QueryEvents.newQuery, () => this.handleNewQuery());
        this.bind.onRootElement(QueryEvents.queryError, (data: IQueryErrorEventArgs) => this.handleQueryError(data));
    }

    /**
     * Performs the "back" action in the browser.
     * Also logs an `errorBack` event in the usage analytics.
     */
    public back(): void {
        this.usageAnalytics.logCustomEvent<IAnalyticsNoMeta>(analyticsActionCauseList.errorBack, {}, this.root);
        this.usageAnalytics.logSearchEvent<IAnalyticsNoMeta>(analyticsActionCauseList.errorBack, {});
        history.back();
    }

    /**
     * Resets the current state of the query and triggers a new query.
     * Also logs an `errorClearQuery` event in the usage analytics.
     */
    public reset(): void {
        this.queryStateModel.reset();
        this.usageAnalytics.logSearchEvent<IAnalyticsNoMeta>(analyticsActionCauseList.errorClearQuery, {});
        this.usageAnalytics.logCustomEvent<IAnalyticsNoMeta>(analyticsActionCauseList.errorClearQuery, {}, this.root);
        this.queryController.executeQuery();
    }

    /**
     * Retries the same query, in case of a temporary service error.
     * Also logs an `errorRetry` event in the usage analytics.
     */
    public retry(): void {
        this.usageAnalytics.logSearchEvent<IAnalyticsNoMeta>(analyticsActionCauseList.errorRetry, {});
        this.usageAnalytics.logCustomEvent<IAnalyticsNoMeta>(analyticsActionCauseList.errorRetry, {}, this.root);
        this.queryController.executeQuery();
    }

    protected buildOrGetTitleElements() {
        const titleElement = $$(this.element).find('.coveo-error-report-title');

        let title: Dom;
        if (titleElement) {
            title = $$(titleElement);
        } else {
            title = $$('div', { className: 'coveo-error-report-title' });
            this.container.prepend(title.el);
        }

        let firstHeading = title.find('h1');
        if (!firstHeading) {
            firstHeading = $$('h1').el;
            title.append(firstHeading);
        }

        let secondHeading = title.find('h2');
        if (!secondHeading) {
            secondHeading = $$('h2').el;
            title.append(secondHeading);
        }

        return {
            title,
            h1: $$(firstHeading),
            h2: $$(secondHeading)
        };
    }

    protected setErrorTitle(errorName?: string, helpSuggestion?: string): void {
        const { defaultErrorTitle, defaultHelpSuggestion } = this.options;

        const errorTitle = {
            h1: errorName ? l(errorName) : defaultErrorTitle,
            h2: helpSuggestion ? l(helpSuggestion) : defaultHelpSuggestion
        };

        const { h1, h2 } = this.buildOrGetTitleElements();

        if (h1 && h2) {
            $$(h1).setHtml(errorTitle.h1);
            $$(h2).setHtml(errorTitle.h2);
        }
    }

    protected buildPrevious(): HTMLElement {
        const previous = $$(
            'span',
            {
                className: 'coveo-error-report-previous'
            },
            l('GoBack')
        );

        new AccessibleButton()
            .withElement(previous)
            .withSelectAction(() => this.back())
            .withLabel(l('GoBack'))
            .build();

        return previous.el;
    }

    protected buildReset(): HTMLElement {
        const reset = $$(
            'span',
            {
                className: 'coveo-error-report-clear'
            },
            l('Reset')
        );

        new AccessibleButton()
            .withElement(reset)
            .withSelectAction(() => this.reset())
            .withLabel(l('Reset'))
            .build();

        return reset.el;
    }

    protected buildRetry(): HTMLElement {
        const retry = $$(
            'span',
            {
                className: 'coveo-error-report-retry'
            },
            l('Retry')
        );

        new AccessibleButton()
            .withElement(retry)
            .withSelectAction(() => this.retry())
            .withLabel(l('Retry'))
            .build();

        return retry.el;
    }

    protected handleNewQuery(): void {
        $$(this.element).hide();
        const { h1, h2 } = this.buildOrGetTitleElements();
        h1.remove();
        h2.remove();
        if (this.closePopup != null) {
            this.closePopup();
        }
    }

    protected handleQueryError(data: IQueryErrorEventArgs): void {
        Assert.exists(data);
        Assert.exists(data.error);

        if (data.endpoint.options.queryStringArguments.organizationId) {
            this.organizationId = data.endpoint.options.queryStringArguments.organizationId;
        } else {
            this.organizationId = l('CoveoOrganization');
        }

        // Do not display the panel if the error is for missing authentication. The
        // appropriate authentication provider should take care of redirecting.
        if ((<MissingAuthenticationError>data.error).isMissingAuthentication) {
            return;
        }

        switch (data.error.name) {
            case 'NoEndpointsException':
                this.options.showDetailedError = false;
                this.buildEndpointErrorElements('https://docs.coveo.com/en/331/');
                this.setErrorTitle(l('NoEndpoints', this.organizationId), l('AddSources'));
                break;

            case 'InvalidTokenException':
                this.options.showDetailedError = false;
                this.buildEndpointErrorElements('https://docs.coveo.com/en/56/');
                this.setErrorTitle(l('CannotAccess', this.organizationId), l('InvalidToken'));
                break;

            case 'GroupByAndFacetBothExistingException':
                this.options.showDetailedError = false;
                this.buildEndpointErrorElements('https://docs.coveo.com/en/2917');
                this.setErrorTitle(undefined, l('GroupByAndFacetRequestsCannotCoexist'));
                break;

            default:
                this.buildOptionsElement();
                this.setErrorTitle();
        }

        if (this.options.showDetailedError) {
            this.message.empty();
            const moreInfo = $$(
                'span',
                {
                    className: 'coveo-error-report-more-info'
                },
                l('MoreInfo')
            );

            moreInfo.on('click', () => {
                moreInfo.empty();
                this.message.el.appendChild(this.buildErrorInfo(data.error));
            });

            this.message.el.appendChild(moreInfo.el);
        }

        $$(this.element).show();
    }

    protected buildErrorInfo(data: IEndpointError): HTMLElement {
        const errorInfo = $$('div', {
            className: 'coveo-error-info'
        });

        let textArea = $$('textarea', undefined, JSON.stringify(data, null, 2));
        errorInfo.el.appendChild(textArea.el);

        const infoLabel = $$(
            'div',
            {
                className: 'coveo-error-info-label'
            },
            l('CopyPasteToSupport')
        );
        errorInfo.el.appendChild(infoLabel.el);

        return errorInfo.el;
    }

    protected buildOptionsElement() {
        const oldOptions = this.container.find('.coveo-error-report-options');
        if (oldOptions) {
            $$(oldOptions).remove();
        }
        const optionsElement = $$('div', { className: 'coveo-error-report-options' });
        optionsElement.el.appendChild(this.buildPrevious());
        optionsElement.el.appendChild(this.buildReset());
        optionsElement.el.appendChild(this.buildRetry());
        this.container.append(optionsElement.el);
    }

    protected buildEndpointErrorElements(helpLink: string = 'https://docs.coveo.com/en/331/') {
        this.helpSuggestion.empty();

        const link = $$('a', {
            href: helpLink,
            className: 'coveo-error-report-help-link'
        });

        link.setHtml(l('CoveoOnlineHelp'));
        this.helpSuggestion.append(link.el);
        this.container.el.insertBefore(this.helpSuggestion.el, this.message.el);
    }

}