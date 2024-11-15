import { Button, Text } from "@shopify/polaris";
import { CustomReviewFormQuestion } from "~/types/types";

export default function CustomQuestionConfigurationDetails({question} : {question: CustomReviewFormQuestion}) {

    if (question.productConfiguration[0] === 'all') return <Text as="p">All Products</Text>

    if (question.productConfiguration[0] === 'products') {
        return (
            <Button>
                {question.productIds.length.toString()} {question.productIds.length > 1 ? 'Products' : 'Product'}
            </Button>
        )
    } else {
        return (
            <Button>
                {question.collectionIds.length.toString()} {question.collectionIds.length > 1 ? 'Collections' : 'Collection'}
            </Button>
        )
    }
} 