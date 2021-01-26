import { NextPage } from 'next';
import React, { useState } from 'react';
import CheckBox from '../components/forms/checkbox';
import SelectUnderline from '../components/forms/select-underline';
import Layout from '../components/layout/layout';
import MainCard from '../components/main-card/main-card';
import SettingsNavBar from '../components/main-card/settings-nav-bar';
import Spinner from '../components/spinner';
import { OptionsInput, Theme, useMeQuery, useMyOptionsQuery } from '../generated/graphql';
import { useSetPartialOptionsMutation } from '../utils/use-set-option-mutation';

const Item: React.FC<{ title: React.ReactNode; error?: string; saving?: boolean }> = ({
  children,
  title,
  error,
  saving,
}) => (
  <article className="relative my-2 py-2 border-b border-gray-300">
    <h3 className="font-semibold mb-1">{title}</h3>
    <div className="font-light text-sm">{children}</div>
    {error ? <div className="font-light text-sm mb-1 text-error">{error}</div> : null}
    {saving ? (
      <div className="absolute right-1 top-2">
        <Spinner />
      </div>
    ) : null}
  </article>
);

const range = (start = 0, stop = 23) => Array.from({ length: stop - start + 1 }, (_, i) => i);

const SettingsPage: NextPage = () => {
  const meData = useMeQuery();
  const { data, loading } = useMyOptionsQuery();
  const [itemSaving, setItemSaving] = useState<Partial<Record<keyof OptionsInput, boolean>>>({});
  const [itemError, setItemError] = useState<Partial<Record<keyof OptionsInput, string>>>({});
  const [saveOptions] = useSetPartialOptionsMutation();

  if (!meData.data?.me) return null;
  const { email, timeZone, locale } = meData.data.me;
  const opts = data?.myOptions;

  const save = async (name: keyof OptionsInput, value: string | number | boolean) => {
    setItemSaving({ [name]: true });
    const { error } = await saveOptions(name, value, opts!);
    if (error) setItemError({ [name]: error });
    else setItemError({});
    setItemSaving({});
  };

  return (
    <Layout>
      <MainCard big>
        <div className="w-full pb-4">
          <SettingsNavBar />
          <div className="mx-auto w-160 max-w-full">
            <section className="flex flex-col p-4">
              <h2 id="info" className="font-bold text-base my-2 border-b border-gray-300">
                Account Information
              </h2>
              <Item title="Email">{email}</Item>
              <Item title="Timezone">{timeZone}</Item>
              <Item title="Locale">{locale}</Item>
            </section>
            {loading ? (
              'loading'
            ) : (
              <section className="flex flex-col w-full p-4">
                <h2 id="digest" className="font-bold text-base my-2 border-b border-gray-300">
                  Digest Settings
                </h2>
                <Item
                  title="Daily digest hour"
                  error={itemError.dailyDigestHour}
                  saving={itemSaving.dailyDigestHour}
                >
                  <div>Select the hour you want to receive daily digests:</div>
                  <div className="w-24">
                    <SelectUnderline
                      name="dailyDigestHour"
                      onChange={(e) => save('dailyDigestHour', parseInt(e.target.value))}
                      value={opts?.dailyDigestHour}
                      className="text-xs mt-2"
                      disabled={itemSaving.dailyDigestHour}
                    >
                      {range(0, 23).map((hour) => (
                        <option key={hour} value={hour}>{`${hour}:00`}</option>
                      ))}
                    </SelectUnderline>
                  </div>
                </Item>
                <Item
                  title="Default theme"
                  error={itemError.themeDefault}
                  saving={itemSaving.themeDefault}
                >
                  <div>Select default email digest theme:</div>
                  <div className="w-24">
                    <SelectUnderline
                      name="themeDefault"
                      onChange={(e) => save('themeDefault', e.target.value)}
                      value={opts?.themeDefault}
                      className="text-xs mt-2"
                      disabled={itemSaving.themeDefault}
                    >
                      <option value={Theme.Default}>Default</option>
                      <option value={Theme.Text}>Text</option>
                    </SelectUnderline>
                  </div>
                </Item>
                <Item
                  title="Table of Content"
                  error={itemError.withContentTableDefault}
                  saving={itemSaving.withContentTableDefault}
                >
                  <div className="flex items-center">
                    <CheckBox
                      id="withContentTableDefault"
                      checked={opts?.withContentTableDefault}
                      onChange={(e) => save('withContentTableDefault', e.target.checked)}
                      disabled={itemSaving.withContentTableDefault}
                    />
                    <label htmlFor="withContentTableDefault" className="ml-1">
                      Include table of content
                    </label>
                  </div>
                </Item>
                <Item
                  title="Feed items content"
                  error={itemError.itemBodyDefault}
                  saving={itemSaving.itemBodyDefault}
                >
                  <div className="flex items-center">
                    <CheckBox
                      id="itemBodyDefault"
                      checked={opts?.itemBodyDefault}
                      onChange={(e) => save('itemBodyDefault', e.target.checked)}
                      disabled={itemSaving.itemBodyDefault}
                    />
                    <label htmlFor="itemBodyDefault" className="ml-1">
                      Show items content
                    </label>
                  </div>
                </Item>
                <Item
                  title="Attachments"
                  error={itemError.attachmentsDefault}
                  saving={itemSaving.attachmentsDefault}
                >
                  <div className="flex items-center">
                    <CheckBox
                      id="attachmentsDefault"
                      checked={!!opts?.attachmentsDefault}
                      onChange={(e) => save('attachmentsDefault', e.target.checked)}
                      disabled={itemSaving.attachmentsDefault}
                    />
                    <label htmlFor="itemBodyDefault" className="ml-1">
                      Include links to attachments (RSS enclosures)
                    </label>
                  </div>
                </Item>
              </section>
            )}
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default SettingsPage;
