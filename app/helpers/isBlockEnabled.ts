import { authenticate } from "~/shopify.server";

export default async function isBlockEnabled(request: Request, blockFileName: string, type: string) {

    const { session, admin } = await authenticate.admin(request)

    const appName = process.env.APP_NAME

    try {
        const themes = await admin.rest.resources.Theme.all({ session })
        const activeTheme = themes.data.find(theme => theme.role === "main")

        if (activeTheme) {
            const theme = await admin.rest.resources.Theme.find({
                session,
                id: activeTheme.id as number
            })
            if (theme) {
                if (type === 'appBlock') {
                    const productData = await admin.rest.resources.Asset.all({
                        session,
                        theme_id: activeTheme.id,
                        asset: {"key":"templates/product.json"}
                    })
                    if (productData.data[0].value) {
                        const data = JSON.parse(productData.data[0].value)
                        const sections: any = Object.values(data.sections)
                        let isBlockEnabled = false
                        for (let i = 0; i<sections.length; i++) {
                            if (sections[i].type === '_blocks' && sections[i].hasOwnProperty('blocks')) {
                                const blockProperties: any = Object.values(Object.values(sections[i].blocks))
                                const block = blockProperties.find((block: any) => {
                                    return block.type.includes(`/apps/${appName}`) && block.type.includes(`/blocks/${blockFileName}`)
                                })
                                if (block) {
                                    return isBlockEnabled = true
                                }
                            }
                        }
                        return isBlockEnabled
                    }
                }

                // if (type === 'appEmbedBlock') {
                //     const settingsData = await admin.rest.resources.Asset.all({
                //         session,
                //         theme_id: activeTheme.id,
                //         asset: {"key":"config/settings_data.json"}
                //     })
                //     if (settingsData.data[0].value) {
                //         const data = JSON.parse(settingsData.data[0].value)
                //         const blocks = Object.values(data.current.blocks)
                //         const block: any = blocks.find((block: any) => {
                //             return block.type.includes(`/apps/${appName}`) && block.type.includes(`/blocks/${blockFileName}`)
                //         })
                //         if (block === undefined) {
                //             return false
                //         }
                //         return block.disabled
                //     }
                // }
            }
        }    
    } catch (error) {
        return false
    }
}