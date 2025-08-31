import { Text } from "@shopify/polaris";
import { ReviewFormQuestion } from "~/types/types";

export default function CustomQuestionConfigurationDetails({question} : {question: ReviewFormQuestion}) {

    if (question.productConfiguration[0] === 'all') return <Text as="p" fontWeight="bold">All Products</Text>

    if (question.productConfiguration[0] === 'products') {
        return (
            <Text as="p" fontWeight="bold">
                {question.productIds.length.toString()} {question.productIds.length > 1 ? 'Products' : 'Product'}
            </Text>
        )
    } else {
        return (
            <Text as="p" fontWeight="bold">
                {question.collectionIds.length.toString()} {question.collectionIds.length > 1 ? 'Collections' : 'Collection'}
            </Text>
        )
    }
} 