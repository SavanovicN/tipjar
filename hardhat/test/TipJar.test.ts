import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { network } from 'hardhat'
import { parseEther } from 'viem'

describe('TipJar', function () {
    it('Should return 0 for a new tip jar', async function () {
        const { viem } = await network.connect()
        const [, , creator] = await viem.getWalletClients()
        
        const tipJar = await viem.deployContract('TipJar')

        const tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, 0n)
    })

    it('Should send a tip to the creator', async function () {
        const { viem } = await network.connect()
        // owner deploys contract
        // tipper sends the tip
        // creator receives the tip
        const [, tipper, creator] = await viem.getWalletClients()

        // Deploy contract (first account deploys by default)
        const tipJar = await viem.deployContract('TipJar')
        
        // Get contract instance connected to tipper account
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)
        
        // Call function directly from tipper's account
        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            { 
                account: tipper.account,
                value: parseEther('0.1')
            }
        )

        const tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, parseEther('0.1'))
    })

    it('Should allow the tip withdrawl', async function () {
        const { viem } = await network.connect()
        const [, , creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')

        await tipJar.write.tipCreator(
            [creator.account.address],
            { value: parseEther('0.1') }
        )

        const tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, parseEther('0.1'))
    })

    it('Should reject withdrawal if no tips', async function () {
        const { viem } = await network.connect()
        await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsCreator = await viem.getContractAt('TipJar', tipJar.address)

        await assert.rejects(
            tipJarAsCreator.write.withdraw(),
            /NoTipToWithdraw/
        )
    })

    it('Should reject tip to zero address', async function () {
        const { viem } = await network.connect()
        const [, tipper] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)

        const zeroAddress = '0x0000000000000000000000000000000000000000'

        await assert.rejects(
            tipJarAsTipper.write.tipCreator(
                [zeroAddress],
                {
                    account: tipper.account,
                    value: parseEther('0.1')
                }
            ),
            /InvalidAddress/
        )
    })

    it ('Should reject tip to zero amount', async function () {
        const { viem } = await network.connect()
        const [, tipper] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)

        await assert.rejects(
            tipJarAsTipper.write.tipCreator(
                [tipper.account.address],
                {
                    account: tipper.account,
                    value: parseEther('0')
                }
            ),
            /InvalidAmount/
        )
    })

    it('Should reject tip if no value sent', async function () {
        const { viem } = await network.connect()
        const [, tipper, creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)

        await assert.rejects(
            tipJarAsTipper.write.tipCreator(
                [creator.account.address],
                {
                    account: tipper.account,
                    value: 0n
                }
            ),
            /InvalidAmount/
        )
    })

    it('Should accumulate multiple tips from same tipper', async function () {
        const { viem } = await network.connect()
        const [, tipper, creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)

        // First tip
        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            {
                account: tipper.account,
                value: parseEther('0.1')
            }
        )

        // Second tip from same tipper
        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            {
                account: tipper.account,
                value: parseEther('0.2')
            }
        )

        // Third tip from same tipper
        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            {
                account: tipper.account,
                value: parseEther('0.3')
            }
        )

        // Total should be 0.6 MATIC
        const tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, parseEther('0.6'))
    })

    it('Should accumulate tips from multiple tippers', async function () {
        const { viem } = await network.connect()
        const [, tipper1, tipper2, tipper3, creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper1 = await viem.getContractAt('TipJar', tipJar.address)
        const tipJarAsTipper2 = await viem.getContractAt('TipJar', tipJar.address)
        const tipJarAsTipper3 = await viem.getContractAt('TipJar', tipJar.address)

        // Tipper 1 sends 0.1 MATIC
        await tipJarAsTipper1.write.tipCreator(
            [creator.account.address],
            {
                account: tipper1.account,
                value: parseEther('0.1')
            }
        )

        // Tipper 2 sends 0.25 MATIC
        await tipJarAsTipper2.write.tipCreator(
            [creator.account.address],
            {
                account: tipper2.account,
                value: parseEther('0.25')
            }
        )

        // Tipper 3 sends 0.15 MATIC
        await tipJarAsTipper3.write.tipCreator(
            [creator.account.address],
            {
                account: tipper3.account,
                value: parseEther('0.15')
            }
        )

        // Total should be 0.5 MATIC
        const tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, parseEther('0.5'))
    })

    it('Should allow multiple withdrawals after receiving new tips', async function () {
        const { viem } = await network.connect()
        const [, tipper1, tipper2, creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper1 = await viem.getContractAt('TipJar', tipJar.address)
        const tipJarAsTipper2 = await viem.getContractAt('TipJar', tipJar.address)
        const tipJarAsCreator = await viem.getContractAt('TipJar', tipJar.address)

        // First tip
        await tipJarAsTipper1.write.tipCreator(
            [creator.account.address],
            {
                account: tipper1.account,
                value: parseEther('0.5')
            }
        )

        // Creator withdraws first tip
        await tipJarAsCreator.write.withdraw({
            account: creator.account
        })

        // Verify balance is zero after withdrawal
        let tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, 0n)

        // Second tip arrives
        await tipJarAsTipper2.write.tipCreator(
            [creator.account.address],
            {
                account: tipper2.account,
                value: parseEther('0.3')
            }
        )

        // Verify new tip accumulated
        tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, parseEther('0.3'))

        // Creator withdraws second tip
        await tipJarAsCreator.write.withdraw({
            account: creator.account
        })

        // Verify balance is zero again
        tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, 0n)
    })

    it('Should handle multiple creators independently', async function () {
        const { viem } = await network.connect()
        const [, tipper, creator1, creator2] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)

        // Tip creator 1
        await tipJarAsTipper.write.tipCreator(
            [creator1.account.address],
            {
                account: tipper.account,
                value: parseEther('0.5')
            }
        )

        // Tip creator 2
        await tipJarAsTipper.write.tipCreator(
            [creator2.account.address],
            {
                account: tipper.account,
                value: parseEther('0.3')
            }
        )

        // Verify each creator has their own balance
        const tips1 = await tipJar.read.tips([creator1.account.address])
        const tips2 = await tipJar.read.tips([creator2.account.address])

        assert.equal(tips1, parseEther('0.5'))
        assert.equal(tips2, parseEther('0.3'))
    })
})
