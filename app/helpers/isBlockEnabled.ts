import { authenticate } from "~/shopify.server";

// checks if review widget is enabled on store's current theme 

function containsAppName(obj: any, appName: string) {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recurse into nested objects or arrays
        if (containsAppName(obj[key], appName)) {
          return true;
        }
      } else {
        // Convert the value to string and check if keyword is present
        if (String(obj[key]).includes(appName)) {
          return true;
        }
      }
    }
    return false;
  }

export default async function isBlockEnabled(request: Request, type: string) {

    const { session, admin } = await authenticate.admin(request)

    const appName = process.env.APP_NAME as string

    try {
        const themes = await admin.rest.resources.Theme.all({ session })
        const activeTheme = themes.data.find(theme => theme.role === "main")

        if (activeTheme) {
            const theme = await admin.rest.resources.Theme.find({
                session,
                id: activeTheme.id as number
            })
            if (theme) {
                const productData = await admin.rest.resources.Asset.all({
                    session,
                    theme_id: activeTheme.id,
                    asset: {"key":"templates/product.json"}
                })
                if (productData.data[0].value) {
                    const data = JSON.parse(productData.data[0].value)
                    const sections: any = Object.values(data.sections)
                    return containsAppName(sections, appName)
                }
            }
            return false
        }    
        return false
    } catch (error) {
        return false
    }
}