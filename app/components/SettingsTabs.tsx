import { Card, InlineStack, Text } from "@shopify/polaris"

import styles from '../styles/Settings.module.css'
import { useNavigate } from "@remix-run/react"

import {
    SettingsIcon,
    EmailIcon,
    ShieldCheckMarkIcon,
    ClockIcon
  } from '@shopify/polaris-icons';

interface Props {
    store: string,
    path: string
}

export default function SettingsTabs({store, path}: Props) {

    const nav = useNavigate()

    const settingTabs = [
        {name: 'General', path: 'general', icon: <SettingsIcon height={20} width={20} />}, 
        {name: 'Review Request Timing', path: 'review-request-timing', icon: <ClockIcon height={20} width={20} />},
        {name: 'Review Verification', path: 'verification', icon: <ShieldCheckMarkIcon height={20} width={20} />}
    ]

    return (

        <Card padding={'0'}>
            <div>
                <div style={{backgroundColor: '#FAFAFA', width: '100%', padding: '10px 20px'}}>
                    <Text as="p" fontWeight="bold">Settings</Text>
                    <Text as="p">{store}</Text>
                </div>
                <div style={{padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    { settingTabs.map((tab: any) => {
                        return (
                            <div 
                            onClick={() => { nav(`/app/settings/${tab.path}`)}} 
                            style={{backgroundColor: path === tab.path.toLowerCase() ? 'rgb(230, 230, 230)' : 'white'}} 
                            className={styles.tabContainer}
                            >
                                <InlineStack gap='100'>
                                    {tab.icon}
                                    <div>{tab.name}</div>     
                                </InlineStack>
                            </div>
                        ) 
                    })}
                </div>
            </div>
        </Card>
)
}