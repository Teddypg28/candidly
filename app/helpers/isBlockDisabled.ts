import { authenticate } from "~/shopify.server";

export default async function isBlockDisabled(request: Request, blockFileName: string, type: string) {

    const { session, admin } = await authenticate.admin(request)

    const appName = process.env.APP_NAME

    try {

        const themes = await admin.rest.resources.Theme.all({ session })

        const activeThemeId = themes.data[0].id

        if (activeThemeId) {

            const activeTheme = await admin.rest.resources.Theme.find({
                session,
                id: activeThemeId
            })

            if (activeTheme) {

                if (type === 'appBlock') {

                    const productData = await admin.rest.resources.Asset.all({
                        session,
                        theme_id: activeTheme.id,
                        asset: {"key":"templates/product.json"}
                    })
    
                    if (productData.data[0].value) {
                        
                        const data = JSON.parse(productData.data[0].value)
    
                        const sections: any = Object.values(data.sections)

                        let isBlockDisabled = true
    
                        for (let i = 0; i<sections.length; i++) {
                            if (sections[i].type === 'apps' && sections[i].hasOwnProperty('blocks')) {
                                const blockProperties: any = Object.values(Object.values(sections[i].blocks))

                                const block = blockProperties.find((block: any) => {
                                    return block.type.includes(`/apps/${appName}`) && block.type.includes(`/blocks/${blockFileName}`)
                                })

                                if (block !== undefined) {
                                    return isBlockDisabled = false
                                }

                            }
                        }

                        return isBlockDisabled
    
                    }

                }

                if (type === 'appEmbedBlock') {

                    const settingsData = await admin.rest.resources.Asset.all({
                        session,
                        theme_id: activeTheme.id,
                        asset: {"key":"config/settings_data.json"}
                    })
    
                    if (settingsData.data[0].value) {
        
                        const data = JSON.parse(settingsData.data[0].value)
        
                        const blocks = Object.values(data.current.blocks)
    
                        const block: any = blocks.find((block: any) => {
                            return block.type.includes(`/apps/${appName}`) && block.type.includes(`/blocks/${blockFileName}`)
                        })
    
                        if (block === undefined) {
                            return false
                        }
    
                        return block.disabled
        
                    }

                }
                
            }
        }    

    } catch (error) {

        return false
        
    }

}