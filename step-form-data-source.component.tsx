import React, { Suspense, lazy, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { useAtomValue } from 'jotai';
import { OwcAssistiveText, OwcListItem, OwcSelectDropdown, OwcTypography } from '@one/react';
import type { OwcSelectDropdownCustomEvent } from '@one/web-components/dist/types/components';

import { useTranslatedKeys } from 'core/i18n';
import { useLocalization } from 'core/localization';
import { unsetInputWidthCss } from 'common/styles';
import { formatRequiredField, isNonEmptyString } from 'common/utils';
import {
  Card,
  CardContent,
  CardSection,
  CardTitle,
  OwcDatepickerControlled,
  OwcDatepickerControlledProps,
  OwcInputControlled,
  OwcInputControlledProps,
  ProgressOverlayFallback,
} from 'common/components';
import { DataSourceConnectionSettings } from '../edge-data-sources.model';
import { dataSourceTypeCandidatesAtom } from '../edge-data-sources.state';
import { StepFormProps } from './data-source-connection-wizard.model';
import { isDatasourceTypeEligible } from './data-source-connection-wizard.validations';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { remoteAppAngular } from 'remoteApp/CounterComp';

/**
 * CSS
 */
const dropdownCss = css`
  width: 100%;
`;
const endAlignmentCss = css`
  justify-self: end;
`;

/**
 * Component
 */
export const StepFormDatasource: React.FC<StepFormProps> = ({ wizard, ...cardProps }) => {

  useEffect(() => {
    remoteAppAngular();
  }, []);

  const { useDirtyField } = wizard ?? {};
  const tkeys = useTranslatedKeys('global', 'edge');

  // State
  // Show/hide configuration based on type selection.
  const dirtyType = useDirtyField('source', 'type');




  const dirtyApplicationCode = useDirtyField('application', 'code');
  const dirtyApplicationName = useDirtyField('application', 'name');

  console.log(dirtyApplicationCode);
  console.log(dirtyType);

  return (
    <Card {...cardProps}>
      <CardTitle showSeparator>
        {tkeys.edge.sources.wizard.source.cardTitle} - {dirtyApplicationCode}
      </CardTitle>

      <CardContent>
        {dirtyApplicationCode === 'LABOPS' && (
          <div
            style={{
              display: 'flex',
              paddingLeft: '30px',
              paddingRight: '10px',
              alignItems: 'center',
              textAlign: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: '<counter-angular />' }}
          />
        )}

        {dirtyApplicationCode !== 'LABOPS' && (
          <CardSection extraPaddingTop>
            <DatasourceDropdownWithValidation wizard={wizard} />
          </CardSection>
        )}

        {isNonEmptyString(dirtyType) && (
          <CardSection title={tkeys.edge.sources.wizard.source.configurationLabel} extraPaddingTop>
            <StringInputWithValidation
              field="name"
              wizard={wizard}
              label={tkeys.edge.sources.wizard.source.nameLabel}
            />
            <StringInputWithValidation
              field="serverIp"
              wizard={wizard}
              label={formatRequiredField(tkeys.edge.sources.wizard.source.serverIpLabel)}
              required
            />
            <NumericInputWithValidation
              field="serverPort"
              wizard={wizard}
              label={formatRequiredField(tkeys.edge.sources.wizard.source.serverPortLabel)}
              required
            />
            <StringInputWithValidation
              field="uid"
              wizard={wizard}
              label={formatRequiredField(tkeys.edge.sources.wizard.source.uidLabel)}
              required
            />
            <GenericDateWithValidation
              field="installationDate"
              wizard={wizard}
              label={formatRequiredField(tkeys.edge.sources.wizard.source.installationDateLabel)}
              required
            />
            <GenericDateWithValidation
              field="initialLoadFromDate"
              wizard={wizard}
              label={formatRequiredField(tkeys.edge.sources.wizard.source.initialLoadFromDateLabel)}
              required
            />
          </CardSection>
        )}
        <CardSection extraPaddingBottom>
          <OwcTypography css={endAlignmentCss} variant="caption">
            {formatRequiredField(' ') + tkeys.global.validation.requiredFieldsLabel}
          </OwcTypography>
        </CardSection>
      </CardContent>
    </Card>
  );
};

/**
 * Controls - Dropdown
 */
const DatasourceDropdownWithValidation: React.FC<{
  wizard: StepFormProps['wizard'];
}> = ({ wizard: { useDirtyField, onChangeField, useFieldValidation } }) => {
  const tkeys = useTranslatedKeys('global', 'edge');

  // State
  const { data: datasourceTypeCandidates, isFetching } = useAtomValue(dataSourceTypeCandidatesAtom);

  const dirtyType = useDirtyField('source', 'type');
  const datasourceTypeValidation = useFieldValidation('source', 'type');
  // PENDING: temporary manual validation results for eligible datasource types. TO BE DELETED.
  const anyDatasourceTypeEligibleValidation = useFieldValidation(
    'source',
    'datasourceTypeCandidates' as any
  );

  // Computed values
  const isDatasourceTypeValidated =
    anyDatasourceTypeEligibleValidation.succeeded && datasourceTypeValidation.succeeded;

  // Handlers
  const handleDatasourceTypeChange = (
    event: OwcSelectDropdownCustomEvent<string | (string | number)[]>
  ) => {


    const newType: string = event.detail[0] as string;

    console.log(newType);
    // Clear step state whenever a different type is selected.
    const resetStepState = !isNonEmptyString(newType) || newType !== dirtyType;

    onChangeField('source', 'type', newType, { resetStepState });
    if (resetStepState)
      onChangeField('source', 'datasourceTypeCandidates' as any, datasourceTypeCandidates);
  };

  // Effects
  React.useEffect(() => {
    // PENDING: temporary trick to run manual field validation for eligible applications. TO BE DELETED.
    if (!isFetching) {
      onChangeField('source', 'datasourceTypeCandidates' as any, datasourceTypeCandidates);
    }
  }, [datasourceTypeCandidates, isFetching]);

  return (
    <>
      {isFetching && <ProgressOverlayFallback absolute />}
      <OwcSelectDropdown
        css={dropdownCss}
        value={dirtyType}
        validity={{ state: isDatasourceTypeValidated ? 'valid' : 'error' }}
        required
        label={formatRequiredField(tkeys.edge.sources.wizard.source.dataSourceTypeLabel)}
        multiple={false}
        onValueChange={handleDatasourceTypeChange}
      >
        <div>
          {datasourceTypeCandidates?.map(typeCandidate => (
            <OwcListItem
              key={typeCandidate.code}
              value={typeCandidate.code}
              disabled={!isDatasourceTypeEligible(typeCandidate)}
            >
              {typeCandidate.name}
            </OwcListItem>
          ))}
        </div>
        <OwcAssistiveText slot="assistive-text" status="alert">
          {!isDatasourceTypeValidated && (
            <span>
              {anyDatasourceTypeEligibleValidation.message || datasourceTypeValidation.message}
            </span>
          )}
        </OwcAssistiveText>
      </OwcSelectDropdown>
    </>
  );
};

/**
 * Controls - Inputs
 */
type DatasourceStringInputFields = Exclude<
  keyof DataSourceConnectionSettings['source'],
  'serverPort' | 'installationDate' | 'initialLoadFromDate'
>;
type DatasourceNumericInputFields = Extract<
  keyof DataSourceConnectionSettings['source'],
  'serverPort'
>;

interface StringInputWithValidationProps<F extends DatasourceStringInputFields>
  extends Omit<OwcInputControlledProps, 'value' | 'onValueChange'> {
  field: F;
  wizard: StepFormProps['wizard'];
}

const StringInputWithValidation = <F extends DatasourceStringInputFields>({
  field,
  wizard: { useDirtyField, onChangeField, useFieldValidation },
  ...restProps
}: StringInputWithValidationProps<F>) => {
  const dirtyValue = useDirtyField('source', field);
  const validation = useFieldValidation('source', field);

  return (
    <OwcInputControlled
      css={unsetInputWidthCss}
      value={dirtyValue ?? ''}
      validity={{ state: !validation.succeeded ? 'error' : 'valid' }}
      onValueChange={(_event, value) => onChangeField('source', field, value)}
      {...restProps}
    >
      <OwcAssistiveText>
        {!validation.succeeded ? <span>{validation.message}</span> : undefined}
      </OwcAssistiveText>
    </OwcInputControlled>
  );
};

interface NumericInputWithValidationProps<F extends DatasourceNumericInputFields>
  extends Omit<OwcInputControlledProps, 'value' | 'onValueChange'> {
  field: F;
  wizard: StepFormProps['wizard'];
}

const NumericInputWithValidation = <F extends DatasourceNumericInputFields>({
  field,
  wizard: { useDirtyField, onChangeField, useFieldValidation },
  ...restProps
}: NumericInputWithValidationProps<F>) => {
  const dirtyValue = useDirtyField('source', field);
  const validation = useFieldValidation('source', field);

  return (
    <OwcInputControlled
      css={unsetInputWidthCss}
      value={dirtyValue?.toString() ?? ''}
      validity={{ state: !validation.succeeded ? 'error' : 'valid' }}
      onValueChange={(_event, value) => {
        const numValue = isNonEmptyString(value) ? Number(value) : undefined; // To avoid '' converted into 0
        onChangeField('source', field, numValue);
      }}
      nativeInputProps={{ type: 'number' }}
      {...restProps}
    >
      <OwcAssistiveText>
        {!validation.succeeded ? <span>{validation.message}</span> : undefined}
      </OwcAssistiveText>
    </OwcInputControlled>
  );
};

/**
 * Controls - Dates
 */
type DatasourceDateFields = Extract<
  keyof DataSourceConnectionSettings['source'],
  'installationDate' | 'initialLoadFromDate'
>;

interface GenericDateWithValidationProps<F extends DatasourceDateFields>
  extends Omit<OwcDatepickerControlledProps, 'value' | 'onValueChange'> {
  field: F;
  wizard: StepFormProps['wizard'];
}

const GenericDateWithValidation = <F extends DatasourceDateFields>({
  field,
  wizard: { useDirtyField, onChangeField, useFieldValidation },
  ...restProps
}: GenericDateWithValidationProps<F>) => {
  const dirtyValue = useDirtyField('source', field);
  const validation = useFieldValidation('source', field);

  const { dateTimeMask } = useLocalization();

  return (
    <OwcDatepickerControlled
      css={unsetInputWidthCss}
      format={dateTimeMask.date}
      value={dirtyValue}
      validity={{ state: !validation.succeeded ? 'error' : 'valid' }}
      onValueChange={(_event, value) => onChangeField('source', field, value)}
      {...restProps}
    >
      <OwcAssistiveText>
        {!validation.succeeded ? <span>{validation.message}</span> : undefined}
      </OwcAssistiveText>
    </OwcDatepickerControlled>
  );
};
