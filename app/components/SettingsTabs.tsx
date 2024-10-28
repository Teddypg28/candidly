import { Card, InlineStack, Text } from "@shopify/polaris"

import styles from '../styles/Settings.module.css'
import { useNavigate } from "@remix-run/react"

interface Props {
    store: string,
    tabs: {name: string, path: string, icon: React.ReactNode}[],
    selectedTabPath: string
}

export default function SettingsTabs({store, tabs, selectedTabPath}: Props) {

    const nav = useNavigate()

    return (

        <Card padding={'0'}>
            <div>
                <div style={{backgroundColor: '#FAFAFA', width: '100%', padding: '10px 20px'}}>
                    <Text as="p" fontWeight="bold">Settings</Text>
                    <Text as="p">{store}</Text>
                </div>
                <div style={{padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    { tabs.map((tab: any) => {
                        return (
                            <div 
                            onClick={() => { nav(`/app/settings/${tab.path}`)}} 
                            style={{backgroundColor: selectedTabPath === tab.path.toLowerCase() ? 'rgb(230, 230, 230)' : 'white'}} 
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