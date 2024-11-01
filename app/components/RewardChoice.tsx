import { BlockStack, Text, Select, TextField, Banner } from "@shopify/polaris"

interface State {
    subpar: {
        selectedRewardType: string,
        dollarAmount: number,
        percentageAmount: number,
        purchaseAmount: number,
        freeAmount: number
    },
    good: {
        selectedRewardType: string,
        dollarAmount: number,
        percentageAmount: number,
        purchaseAmount: number,
        freeAmount: number
    },
    perfect: {
        selectedRewardType: string,
        dollarAmount: number,
        percentageAmount: number,
        purchaseAmount: number,
        freeAmount: number
    }
}

interface Props {

    type: string,
    state: State,
    setState: (state: State) => void

}

export default function RewardChoice({type, state, setState} : Props) {

    const isNumberRestricted = (value: number) => {
        return value <= 0 || isNaN(value)
    }

    const isDollarAmountError = isNumberRestricted(state[type as keyof State].dollarAmount)
    const isPercentageAmountError = isNumberRestricted(state[type as keyof State].percentageAmount)
    const isPurchaseAmountError = isNumberRestricted(state[type as keyof State].purchaseAmount)
    const isFreeAmountError = isNumberRestricted(state[type as keyof State].freeAmount)

    const rewardDescription = type === 'perfect' ? 
    'A perfect review earns the best reward with a headline that has a mininum of 10 words, a body with a minimum of 40 words, and 2 or more images/videos' :
    type === 'good' ?
    'A good review contains a headline with a minimum of 4 words, a body with a minimum of 15 words, and at least 1 image/video' :
    'A subpar review has a headline with a maximum of 3 words, a body with a maximum of 10 words, and no images/videos.'

    return (
    
    <BlockStack gap={'200'}>
        <Banner>{rewardDescription}</Banner>
        <Select
        label='Reward Type'
        value={state[type as keyof State].selectedRewardType}
        onChange={(selected: string) => setState({...state, [type]: {...state[type as keyof State], selectedRewardType: selected}})}
        options={[
            {label: 'Buy X Get Y Free', value: 'bogo'},
            {label: 'Percent Discount', value: 'percent'},
            {label: 'Dollar Discount', value: 'dollar'},
            {label: 'No Reward', value: 'none'}
        ]}
        />
        {state[type as keyof State].selectedRewardType === 'dollar' && 
        <TextField 
        type="integer" 
        autoComplete="off"
        label="Amount"
        suffix={state[type as keyof State].dollarAmount === 1 ? "dollar" : "dollars"}
        error={isDollarAmountError}
        value={state[type as keyof State].dollarAmount.toString()}
        onChange={(value: string) => setState({...state, [state[type as keyof State].dollarAmount]: parseInt(value)})}
        min={1}
        />}
        {isDollarAmountError && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
        {state[type as keyof State].selectedRewardType === 'percent' && 
        <TextField 
        type="integer" 
        autoComplete="off"
        suffix="percent"
        label="Amount"
        error={isPercentageAmountError}
        value={state[type as keyof State].percentageAmount.toString()}
        onChange={(value: string) => setState({...state, [state[type as keyof State].percentageAmount]: parseInt(value)})}
        min={1}
        />}
        {isDollarAmountError && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
        {state[type as keyof State].selectedRewardType === 'bogo' && 
        <>
            <TextField 
            type="integer" 
            autoComplete="off"
            label="Purchase Amount"
            error={isPurchaseAmountError}
            value={state[type as keyof State].purchaseAmount.toString()}
            onChange={(value: string) => setState({...state, [state[type as keyof State].purchaseAmount]: parseInt(value)})}
            min={1}
            />
            {isPurchaseAmountError && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            <TextField 
            type="integer" 
            autoComplete="off"
            label="Free Amount"
            error={isFreeAmountError}
            value={state[type as keyof State].freeAmount.toString()}
            onChange={(value: string) => setState({...state, [state[type as keyof State].freeAmount]: parseInt(value)})}
            min={1}
            />
            {isFreeAmountError && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
        </>
        
        }
    </BlockStack>
    )

}