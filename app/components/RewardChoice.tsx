import { BlockStack, Text, Select, TextField, Banner, ChoiceList, InlineStack, Button, Thumbnail } from "@shopify/polaris"
import { Reward, SelectedProduct_Bxgy } from "~/types/types"

import { ImageIcon } from "@shopify/polaris-icons";

interface Props {
    state: Reward,
    setState: (state: Reward) => void
    bxgyProductState: SelectedProduct_Bxgy[]
    setBxgyProductState: (state: any) => void
}

export default function RewardChoice({state, setState, bxgyProductState, setBxgyProductState} : Props) {

    const handlePercentageAmountChange = (key: string, value: string) => {
        setState({...state, [key]: isNaN(parseFloat(value)) || parseFloat(value) > 1 ? 0.01 : parseFloat(parseFloat(value).toFixed(2))})
    }

    const handlePercentageAmountBlur = (key: string) => {
        if (state[key as keyof typeof state] === 0) {
            setState({...state, [key]: 0.01})
        }
    }

    const handleMinPurchaseValChange = (value: string, key: string) => {
        setState({...state, [key]: isNaN(parseInt(value)) || parseInt(value) < 1 ? 1 : parseInt(value)})
    }

    const isNumberRestricted = (value: number) => {
        return value <= 0 || isNaN(value)
    }

    const errors: any = {}
    let isError = false
    Object.keys(state).forEach((key) => {
        const numberKeys = ['fixedAmount', 'bxgyPurchaseAmount', 'bxgyReceiveAmount']
        if (numberKeys.includes(key)) {
            if (isNumberRestricted(state[key as keyof Reward] as number)) {
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
            setState({...state, bxgyPurchaseProductId: product[0].id})
            const updatedBxgyProductState = bxgyProductState.filter((product, index) => index === 1)
            setBxgyProductState({...updatedBxgyProductState, title: product[0].title, image: product[0].images[0].originalSrc || null})
        }
    }

    const selectBxgyReceiveProduct = async () => {
        const product = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
        })
        if (product) {
            setState({...state, bxgyReceiveProductId: product[0].id})
            const updatedBxgyProductState = bxgyProductState.filter((product, index) => index === 0)
            setBxgyProductState({...updatedBxgyProductState, title: product[0].title, image: product[0].images[0].originalSrc || null})
        }
    }

    return (
    <BlockStack gap={'200'}>
        <BlockStack gap={'200'}>
            <Select
            label='Reward Type'
            disabled={isError}
            value={state.selectedRewardType}
            onChange={(selected: string) => setState({...state, selectedRewardType: selected})}
            options={[
                {label: 'Buy X Get Y', value: 'bxgy'},
                {label: 'Free Shipping', value: 'free-shipping'},
                {label: 'Percent Discount', value: 'percent'},
                {label: 'Dollar Discount', value: 'dollar'},
            ]}
            />
            {state.selectedRewardType === 'dollar' && 
            <>
                <TextField 
                type="number" 
                autoComplete="off"
                label="Amount"
                suffix={state.dollarAmount === 1 ? "dollar" : "dollars"}
                disabled={isError && !errors['fixedAmount']}
                error={errors['fixedAmount']}
<<<<<<< HEAD
                value={state.dollarAmount.toString()}
                onChange={(value: string) => setState({...state, dollarAmount: parseInt(value)})}
=======
                value={state.rewards[type as keyof typeof state.rewards].dollarAmount.toString()}
                onChange={(value: string) => setState({...state, rewards: {...state.rewards, [type]: {...state.rewards[type as keyof typeof state.rewards], fixedAmount: parseInt(value)}}})}
>>>>>>> parent of 6038667 (fixed reward generation bugs)
                min={1}
                />
                {errors['fixedAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </>
            }
            {state.selectedRewardType === 'percent' && 
                <TextField 
                type="number" 
                autoComplete="off"
                inputMode="decimal"
                suffix="percent"
                label="Amount"
                helpText="Enter a decimal (ex: 0.4 for 40% off)"
                disabled={isError && !errors['percentageAmount']}
                error={errors['percentageAmount']}
                value={state.percentageAmount.toString()}
                onChange={(val) => handlePercentageAmountChange("percentageAmount", val)}
                onBlur={() => handlePercentageAmountBlur("percentageAmount")}
                min={0.01}
                max={1}
                step={0.01}
                />
            }
            {state.selectedRewardType === 'bxgy' && 
            <>
                <TextField 
                type="number" 
                autoComplete="off"
                label="Customer Buys"
                error={errors['bxgyPurchaseAmount']}
                disabled={isError && !errors['bxgyPurchaseAmount']}
                value={state.bxgyPurchaseAmount.toString()}
                onChange={(value: string) => setState({...state, bxgyPurchaseAmount: parseInt(value)})}
                min={1}
                />
                {errors['bxgyPurchaseAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
                <InlineStack>
                    <Button onClick={selectBxgyPurchaseProduct} variant="primary">
                        {`${!state.bxgyPurchaseProductId ? "Select" : "Change"} Product`}
                    </Button>
                </InlineStack>
                {state.bxgyPurchaseProductId &&
                <InlineStack>
                    <InlineStack blockAlign="center" gap={'100'}>
                        <Thumbnail source={bxgyProductState[0].image || ImageIcon} alt={bxgyProductState[0].title} />
                        <Text as="p" variant="bodyMd" fontWeight="bold">{bxgyProductState[0].title}</Text>
                    </InlineStack>
                </InlineStack>
                }
                <TextField 
                type="number" 
                autoComplete="off"
                label="Customer Gets"
                disabled={isError && !errors['bxgyReceiveAmount']}
                error={errors['bxgyReceiveAmount']}
                value={state.bxgyReceiveAmount.toString()}
                onChange={(value: string) => setState({...state, bxgyReceiveAmount: parseInt(value)})}
                min={1}
                />
                {errors['bxgyReceiveAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
                <InlineStack>
                    <Button onClick={selectBxgyReceiveProduct} variant="primary">
                        {`${!state.bxgyReceiveProductId ? "Select" : "Change"} Product`}
                    </Button>
                </InlineStack>
                {
                state.bxgyReceiveProductId &&
                <InlineStack>
                    <InlineStack blockAlign="center" gap={'100'}>
                        <Thumbnail source={bxgyProductState[1].image || ImageIcon} alt={bxgyProductState[1].title} />
                        <Text as="p" variant="bodyMd" fontWeight="bold">{bxgyProductState[1].title}</Text>
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
                selected={[state.bxgyRewardType]}
                onChange={(selected: string[]) => setState({...state, bxgyRewardType: selected.toString()})}
                />

                {state.bxgyRewardType === 'percent' ? 
                <TextField 
                type="number" 
                inputMode="decimal"
                autoComplete="off"
                suffix={'percent off'}
                label="Amount"
                value={state.bxgyPercentageAmount.toString()}
                onChange={(val) => handlePercentageAmountChange("bxgyPercentageAmount", val)}
                onBlur={() => handlePercentageAmountBlur("bxgyPercentageAmount")}
                min={0.01}
                max={1}
                step={0.01}
                />
    
                : state.bxgyRewardType === 'dollar' &&
                <TextField 
                type="number" 
                autoComplete="off"
                suffix={state.bxgyDollarAmount > 1 ? 'dollars off' : 'dollar off'}
                label="Amount"
                value={state.bxgyDollarAmount.toString()}
                onChange={(value: string) => setState({...state, bxgyDollarAmount: parseInt(value)})}
                min={1}
                />
                }
                {errors['bxgyDiscountAmount'] && <Text as="p" tone="critical">Please enter a number that is greater than or equal to 1</Text>}
            </> }
        </BlockStack>
        {state.selectedRewardType !== 'none' &&
            <BlockStack>
                <ChoiceList
                disabled={isError}
                selected={[state.minPurchaseType]}
                onChange={(selected) => setState({...state, minPurchaseType: selected.toString()})}
                title='Minimum Purchase Requirements'
                choices={[
                    { label: 'No minimum purchase requirements', value: 'none' },
                    { label: 'Minimum purchase amount ($)', value: 'dollars', renderChildren(isSelected) {
                        return isSelected ? 
                        <TextField 
                        type="text" 
                        placeholder="0.00"
                        value={state.minPurchaseDollarValue.toString()} 
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
                            value={state.minPurchaseQuantityValue.toString()} 
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