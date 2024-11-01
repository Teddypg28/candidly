import { BlockStack, Text, Select, TextField, Banner, ChoiceList, Card, InlineStack } from "@shopify/polaris"
import { RewardState } from "~/types/types"
import { Reward } from "~/types/types"

interface Props {

    type: string,
    state: RewardState,
    setState: (state: RewardState) => void

}

export default function RewardChoice({type, state, setState} : Props) {

    const isNumberRestricted = (value: number) => {
        return value <= 0 || isNaN(value)
    }

    const errors: any = {}
    let isError = false
    Object.keys(state[type as keyof RewardState]).forEach((key) => {
        const integerKeys = ['fixedAmount', 'percentageAmount', 'bogoPurchaseAmount', 'bogoReceiveAmount', 'bogoDiscountAmount']
        if (integerKeys.includes(key)) {
            if (isNumberRestricted(state[type as keyof RewardState][key as keyof Reward] as number)) {
                errors[key] = true
                isError = true
            } else {
                errors[key] = false
            }
        }
    })

    const rewardDescription = type === 'perfect' ? 
    'A perfect review earns the best reward with a headline that has a mininum of 10 words, a body with a minimum of 40 words, and 2 or more images/videos' :
    type === 'good' ?
    'A good review contains a headline with a minimum of 4 words, a body with a minimum of 15 words, and at least 1 image/video' :
    'A subpar review has a headline with a maximum of 3 words, a body with a maximum of 10 words, and no images/videos.'

    return (
    <BlockStack gap={'200'}>
        <BlockStack gap={'200'}>
            <Banner>{rewardDescription}</Banner>
            <Select
            label='Reward Type'
            disabled={isError}
            value={state[type as keyof RewardState].selectedRewardType}
            onChange={(selected: string) => setState({...state, [type]: {...state[type as keyof RewardState], selectedRewardType: selected}})}
            options={[
                {label: 'Buy X Get Y', value: 'bogo'},
                {label: 'Free Shipping', value: 'free-shipping'},
                {label: 'Percent Discount', value: 'percent'},
                {label: 'Fixed Discount', value: 'dollar'},
                {label: 'No Reward', value: 'none'}
            ]}
            />
            {state[type as keyof RewardState].selectedRewardType === 'dollar' && 
            <>
                <TextField 
                type="integer" 
                autoComplete="off"
                label="Amount"
                suffix={state[type as keyof RewardState].fixedAmount === 1 ? "dollar" : "dollars"}
                disabled={isError && !errors['fixedAmount']}
                error={errors['fixedAmount']}
                value={state[type as keyof RewardState].fixedAmount.toString()}
                onChange={(value: string) => setState({...state, [type]: {...state[type as keyof RewardState], fixedAmount: parseInt(value)}})}
                min={1}
                />
                {errors['fixedAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </>
            }
            {state[type as keyof RewardState].selectedRewardType === 'percent' && 
            <>
                <TextField 
                type="integer" 
                autoComplete="off"
                suffix="percent"
                label="Amount"
                disabled={isError && !errors['percentageAmount']}
                error={errors['percentageAmount']}
                value={state[type as keyof RewardState].percentageAmount.toString()}
                onChange={(value: string) => setState({...state, [type]: {...state[type as keyof RewardState], percentageAmount: parseInt(value)}})}
                min={1}
                />
                {errors['percentageAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </>}
            {state[type as keyof RewardState].selectedRewardType === 'bogo' && 
            <>
                <TextField 
                type="integer" 
                autoComplete="off"
                label="Customer Buys"
                error={errors['bogoPurchaseAmount']}
                disabled={isError && !errors['bogoPurchaseAmount']}
                value={state[type as keyof RewardState].bogoPurchaseAmount.toString()}
                onChange={(value: string) => setState({...state, [type]: {...state[type as keyof RewardState], bogoPurchaseAmount: parseInt(value)}})}
                min={1}
                />
                {errors['bogoPurchaseAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
                <TextField 
                type="integer" 
                autoComplete="off"
                label="Customer Gets"
                disabled={isError && !errors['bogoReceiveAmount']}
                error={errors['bogoReceiveAmount']}
                value={state[type as keyof RewardState].bogoReceiveAmount.toString()}
                onChange={(value: string) => setState({...state, [type]: {...state[type as keyof RewardState], bogoReceiveAmount: parseInt(value)}})}
                min={1}
                />
                {errors['bogoReceiveAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
                <ChoiceList 
                title='Discount Amount'
                disabled={errors['bogoDiscountAmount'] || isError}
                choices={[{label: 'Free', value: 'free'}, {label: 'Percent Discount', value: 'percent'}, {label: 'Dollar Discount', value: 'dollar'}]}
                selected={[state[type as keyof RewardState].bogoRewardType]}
                onChange={(selected: string[]) => setState({...state, [type]: {...state[type as keyof RewardState], bogoRewardType: selected.toString()}})}
                />
                {state[type as keyof RewardState].bogoRewardType === 'percent' ? 
                <TextField 
                type="integer" 
                autoComplete="off"
                suffix={'percent off'}
                label="Amount"
                disabled={isError && !errors['bogoDiscountAmount']}
                error={errors['bogoDiscountAmount']}
                value={state[type as keyof RewardState].bogoDiscountAmount.toString()}
                onChange={(value: string) => setState({...state, [type]: {...state[type as keyof RewardState], bogoDiscountAmount: parseInt(value)}})}
                min={1}
                />
    
                : state[type as keyof RewardState].bogoRewardType === 'fixed' &&
    
                <TextField 
                type="integer" 
                autoComplete="off"
                suffix={state[type as keyof RewardState].fixedAmount > 1 ? 'dollars off' : 'dollar off'}
                label="Amount"
                disabled={isError && !errors['bogoDiscountAmount']}
                error={errors['bogoDiscountAmount']}
                value={state[type as keyof RewardState].bogoDiscountAmount.toString()}
                onChange={(value: string) => setState({...state, [type]: {...state[type as keyof RewardState], bogoDiscountAmount: parseInt(value)}})}
                min={1}
                />
                }
                {errors['bogoDiscountAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </> }
        </BlockStack>
        {state[type as keyof RewardState].selectedRewardType !== 'none' &&
            <BlockStack>
                <Text fontWeight="bold" as="h3">Minimum Purchase Requirements</Text>
                <ChoiceList 
                selected={[state[type as keyof RewardState].minPurchaseRequirements.type]}
                onChange={(selected) => setState({...state, [type]: {...state[type as keyof RewardState], minPurchaseRequirements: {...state[type as keyof RewardState]['minPurchaseRequirements'], type: selected.toString()}}})}
                title=''
                choices={[
                    { label: 'No minimum purchase requirements', value: 'none' },
                    { label: 'Minimum purchase amount ($)', value: 'dollars', renderChildren(isSelected) {
                        return isSelected ? <TextField type="text" prefix='$' autoComplete="off" label='' /> : null
                    }, }, 
                    { label: 'Minimum quantity', value: 'quantity', renderChildren(isSelected) {
                        return isSelected ? <InlineStack> <TextField type="integer" autoComplete="off" label='' /> </InlineStack> : null
                    }, }
            ]}
                />
            </BlockStack>
        }
    </BlockStack>
    )

}