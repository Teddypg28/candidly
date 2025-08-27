import { BlockStack, Text, Select, TextField, Banner, ChoiceList, InlineStack, Button, Thumbnail } from "@shopify/polaris"
import { RewardState, SelectedProduct_Bxgy } from "~/types/types"
import { Reward } from "~/types/types"

import { ImageIcon } from "@shopify/polaris-icons";

interface Props {
    type: string,
    state: RewardState,
    setState: (state: RewardState) => void
    bxgyProductState: {
        subpar: SelectedProduct_Bxgy[];
        good: SelectedProduct_Bxgy[];
        perfect: SelectedProduct_Bxgy[];
        solo: SelectedProduct_Bxgy[]
    }
    setBxgyProductState: (state: any) => void
}

export default function RewardChoice({type, state, setState, bxgyProductState, setBxgyProductState} : Props) {

    const handlePercentageAmountChange = (key: string, value: string) => {
        setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], [key]: isNaN(parseFloat(value)) || parseFloat(value) > 1 ? 0.01 : parseFloat(parseFloat(value).toFixed(2))}}})
    }

    const handlePercentageAmountBlur = (key: string) => {
        const reward = state.rewards[type as keyof typeof state.rewards]
        if (reward[key as keyof typeof reward] === 0) {
            setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], [key]: 0.01}}})
        }
    }

    const handleMinPurchaseValChange = (value: string, key: string) => {
        setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], [key]: isNaN(parseInt(value)) || parseInt(value) < 1 ? 1 : parseInt(value)}}})
    }

    const isNumberRestricted = (value: number) => {
        return value <= 0 || isNaN(value)
    }

    const errors: any = {}
    let isError = false
    Object.keys(state.rewards[type as keyof typeof state.rewards]).forEach((key) => {
        const numberKeys = ['fixedAmount', 'bxgyPurchaseAmount', 'bxgyReceiveAmount']
        if (numberKeys.includes(key)) {
            if (isNumberRestricted(state.rewards[type as keyof typeof state.rewards][key as keyof Reward] as number)) {
                errors[key] = true
                isError = true
            } else {
                errors[key] = false
            }
        }
    })

    const selectBxgyPurchaseProduct = async () => {
        const product = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
        })
        if (product) {
            setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], bxgyPurchaseProductId: product[0].id}}})
            const updatedBxgyProductState = bxgyProductState[type as keyof typeof bxgyProductState].filter((product, index) => index === 1)
            setBxgyProductState({...bxgyProductState, [type]: [{title: product[0].title, image: product[0].images[0].originalSrc || null}, ...updatedBxgyProductState]})
        }
    }

    const selectBxgyReceiveProduct = async () => {
        const product = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
        })
        if (product) {
            setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], bxgyReceiveProductId: product[0].id}}})
            const updatedBxgyProductState = bxgyProductState[type as keyof typeof bxgyProductState].filter((product, index) => index === 0)
            setBxgyProductState({...bxgyProductState, [type]: [...updatedBxgyProductState, {title: product[0].title, image: product[0].images[0].originalSrc || null}]})
        }
    }

    const rewardDescription = type === 'perfect' ? 
    'A perfect review earns the best reward with a headline that has a mininum of 10 words, a body with a minimum of 40 words, and at least 1 image/video' :
    type === 'good' ?
    'A good review contains a headline with a minimum of 5 words, a body with a minimum of 20 words, and at least 1 image/video' :
    'A subpar review has a headline with a minimum of 2 words, a body with a minimum of 10 words, and no images/videos.'

    return (
    <BlockStack gap={'200'}>
        <BlockStack gap={'200'}>
            {state.type === "tiers" && <Banner>{rewardDescription}</Banner>}
            <Select
            label='Reward Type'
            disabled={isError}
            value={state.rewards[type as keyof typeof state.rewards].selectedRewardType}
            onChange={(selected: string) => setState({...state, rewards: {...state.rewards, [type as keyof typeof state.rewards]: {...state.rewards[type as keyof typeof state.rewards], selectedRewardType: selected}}})}
            options={[
                {label: 'Buy X Get Y', value: 'bxgy'},
                {label: 'Free Shipping', value: 'free-shipping'},
                {label: 'Percent Discount', value: 'percent'},
                {label: 'Dollar Discount', value: 'dollar'},
            ]}
            />
            {state.rewards[type as keyof typeof state.rewards].selectedRewardType === 'dollar' && 
            <>
                <TextField 
                type="number" 
                autoComplete="off"
                label="Amount"
                suffix={state.rewards[type as keyof typeof state.rewards].dollarAmount === 1 ? "dollar" : "dollars"}
                disabled={isError && !errors['fixedAmount']}
                error={errors['fixedAmount']}
                value={state.rewards[type as keyof typeof state.rewards].dollarAmount.toString()}
                onChange={(value: string) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], dollarAmount: parseInt(value)}}})}
                min={1}
                />
                {errors['fixedAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </>
            }
            {state.rewards[type as keyof typeof state.rewards].selectedRewardType === 'percent' && 
                <TextField 
                type="number" 
                autoComplete="off"
                inputMode="decimal"
                suffix="percent"
                label="Amount"
                helpText="Enter a decimal (ex: 0.4 for 40% off)"
                disabled={isError && !errors['percentageAmount']}
                error={errors['percentageAmount']}
                value={state.rewards[type as keyof typeof state.rewards].percentageAmount.toString()}
                onChange={(val) => handlePercentageAmountChange("percentageAmount", val)}
                onBlur={() => handlePercentageAmountBlur("percentageAmount")}
                min={0.01}
                max={1}
                step={0.01}
                />
            }
            {state.rewards[type as keyof typeof state.rewards].selectedRewardType === 'bxgy' && 
            <>
                <TextField 
                type="number" 
                autoComplete="off"
                label="Customer Buys"
                error={errors['bxgyPurchaseAmount']}
                disabled={isError && !errors['bxgyPurchaseAmount']}
                value={state.rewards[type as keyof typeof state.rewards].bxgyPurchaseAmount.toString()}
                onChange={(value: string) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], bxgyPurchaseAmount: parseInt(value)}}})}
                min={1}
                />
                {errors['bxgyPurchaseAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
                <InlineStack>
                    <Button onClick={selectBxgyPurchaseProduct} variant="primary">
                        {`${!state.rewards[type as keyof typeof state.rewards].bxgyPurchaseProductId ? "Select" : "Change"} Product`}
                    </Button>
                </InlineStack>
                {state.rewards[type as keyof typeof state.rewards].bxgyPurchaseProductId &&
                <InlineStack>
                    <InlineStack blockAlign="center" gap={'100'}>
                        <Thumbnail source={bxgyProductState[type as keyof typeof state.rewards][0].image || ImageIcon} alt={bxgyProductState[type as keyof typeof state.rewards][0].title} />
                        <Text as="p" variant="bodyMd" fontWeight="bold">{bxgyProductState[type as keyof typeof state.rewards][0].title}</Text>
                    </InlineStack>
                </InlineStack>
                }
                <TextField 
                type="number" 
                autoComplete="off"
                label="Customer Gets"
                disabled={isError && !errors['bxgyReceiveAmount']}
                error={errors['bxgyReceiveAmount']}
                value={state.rewards[type as keyof typeof state.rewards].bxgyReceiveAmount.toString()}
                onChange={(value: string) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], bxgyReceiveAmount: parseInt(value)}}})}
                min={1}
                />
                {errors['bxgyReceiveAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
                <InlineStack>
                    <Button onClick={selectBxgyReceiveProduct} variant="primary">
                        {`${!state.rewards[type as keyof typeof state.rewards].bxgyReceiveProductId ? "Select" : "Change"} Product`}
                    </Button>
                </InlineStack>
                {
                state.rewards[type as keyof typeof state.rewards].bxgyReceiveProductId &&
                <InlineStack>
                    <InlineStack blockAlign="center" gap={'100'}>
                        <Thumbnail source={bxgyProductState[type as keyof typeof state.rewards][1].image || ImageIcon} alt={bxgyProductState[type as keyof typeof state.rewards][1].title} />
                        <Text as="p" variant="bodyMd" fontWeight="bold">{bxgyProductState[type as keyof typeof state.rewards][1].title}</Text>
                    </InlineStack>
                </InlineStack>
                }
                <ChoiceList 
                title='Discount Amount'
                disabled={errors['bxgyDiscountAmount'] || isError}
                choices={[
                    {label: 'Free', value: 'free'}, 
                    {label: 'Percent Discount', value: 'percent'}, 
                    {label: 'Dollar Discount', value: 'dollar'}
                ]}
                selected={[state.rewards[type as keyof typeof state.rewards].bxgyRewardType]}
                onChange={(selected: string[]) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], bxgyRewardType: selected.toString()}}})}
                />

                {state.rewards[type as keyof typeof state.rewards].bxgyRewardType === 'percent' ? 
                <TextField 
                type="number" 
                inputMode="decimal"
                autoComplete="off"
                suffix={'percent off'}
                label="Amount"
                value={state.rewards[type as keyof typeof state.rewards].bxgyPercentageAmount.toString()}
                onChange={(val) => handlePercentageAmountChange("bxgyPercentageAmount", val)}
                onBlur={() => handlePercentageAmountBlur("bxgyPercentageAmount")}
                min={0.01}
                max={1}
                step={0.01}
                />
    
                : state.rewards[type as keyof typeof state.rewards].bxgyRewardType === 'dollar' &&
                <TextField 
                type="number" 
                autoComplete="off"
                suffix={state.rewards[type as keyof typeof state.rewards].bxgyDollarAmount > 1 ? 'dollars off' : 'dollar off'}
                label="Amount"
                value={state.rewards[type as keyof typeof state.rewards].bxgyDollarAmount.toString()}
                onChange={(value: string) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], bxgyDollarAmount: parseInt(value)}}})}
                min={1}
                />
                }
                {errors['bxgyDiscountAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </> }
        </BlockStack>
        {state.rewards[type as keyof typeof state.rewards].selectedRewardType !== 'none' &&
            <BlockStack>
                <ChoiceList
                disabled={isError}
                selected={[state.rewards[type as keyof typeof state.rewards].minPurchaseType]}
                onChange={(selected) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], minPurchaseType: selected.toString()}}})}
                title='Minimum Purchase Requirements'
                choices={[
                    { label: 'No minimum purchase requirements', value: 'none' },
                    { label: 'Minimum purchase amount ($)', value: 'dollars', renderChildren(isSelected) {
                        return isSelected ? 
                        <TextField 
                        type="text" 
                        placeholder="0.00"
                        value={state.rewards[type as keyof typeof state.rewards].minPurchaseDollarValue.toString()} 
                        onChange={(val: string) => handleMinPurchaseValChange(val, "minPurchaseDollarValue")} 
                        prefix='$' 
                        autoComplete="off" 
                        label='' 
                        /> 
                        : null
                    }, }, 
                    { label: 'Minimum quantity', value: 'quantity', renderChildren(isSelected) {
                        return isSelected ? 
                        <InlineStack> 
                            <TextField 
                            type="number" 
                            value={state.rewards[type as keyof typeof state.rewards].minPurchaseQuantityValue.toString()} 
                            min={1} 
                            onChange={(val: string) => handleMinPurchaseValChange(val, "minPurchaseQuantityValue")} 
                            autoComplete="off" 
                            label='' /> 
                        </InlineStack> 
                        : null
                    }}
            ]}
                />
            </BlockStack>
        }
    </BlockStack>
    )
}