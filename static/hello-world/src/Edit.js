import React, { useEffect, useState } from "react";
import Form, { Field } from "@atlaskit/form";
import TextField from "@atlaskit/textfield";
import Button, { ButtonGroup } from "@atlaskit/button";
import { invoke, view } from "@forge/bridge";
import Select from "@atlaskit/select";

function Edit() {
  const [context, setContext] = useState();

  console.error(context);

  const onSubmit = (formData) => {
    view.submit(formData);
  };
  const [data, setData] = useState(null);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  useEffect(() => {
    invoke("getFilters").then(setData);
  }, []);

  if (!data) {
    return "Loading...";
  }

  console.error(data);

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <Field label="Select a filter" name="filter">
            {({ fieldProps }) => (
              <Select
                {...fieldProps}
                isOptionSelected={(option, value) =>
                  option.value ===
                  context.extension.gadgetConfiguration?.filter?.value
                }
                options={[
                  { label: "No filter selected", value: null },
                  ...data,
                ]}
                defaultValue={
                  {
                    value: context.extension.gadgetConfiguration?.filter?.value,
                    label: context.extension.gadgetConfiguration?.filter?.label,
                  } || { label: "No filter selected", value: null }
                }
              />
            )}
          </Field>
          <Field name="name" label="Name">
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <Field name="description" label="Description">
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <br />
          <ButtonGroup>
            <Button type="submit" isDisabled={submitting}>
              Save
            </Button>
            <Button appearance="subtle" onClick={view.close}>
              Cancel
            </Button>
          </ButtonGroup>
        </form>
      )}
    </Form>
  );
}

export default Edit;
