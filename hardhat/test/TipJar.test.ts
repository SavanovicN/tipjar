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
        const [, tipper, creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)
        
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

    it('Should allow the tip withdrawal', async function () {
        const { viem } = await network.connect()
        const [, , creator] = await viem.getWalletClients()
        const publicClient = await viem.getPublicClient()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsCreator = await viem.getContractAt('TipJar', tipJar.address)

        await tipJar.write.tipCreator(
            [creator.account.address],
            { value: parseEther('0.1') }
        )

        const tipsBefore = await tipJar.read.tips([creator.account.address])
        assert.equal(tipsBefore, parseEther('0.1'))

        const balanceBefore = await publicClient.getBalance({ address: creator.account.address })

        await tipJarAsCreator.write.withdraw({
            account: creator.account
        })

        const tipsAfter = await tipJar.read.tips([creator.account.address])
        assert.equal(tipsAfter, 0n)

        const balanceAfter = await publicClient.getBalance({ address: creator.account.address })
        assert.ok(balanceAfter > balanceBefore, 'Creator balance should increase after withdrawal')
    })

    it('Should reject withdrawal if no tips', async function () {
        const { viem } = await network.connect()
        const [, creator] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsCreator = await viem.getContractAt('TipJar', tipJar.address)

        await assert.rejects(
            tipJarAsCreator.write.withdraw({
                account: creator.account
            }),
            /NoTipToWithdraw/
        )
    })

    it('Should reject withdrawal from contract addresses', async function () {
        const { viem } = await network.connect()

        const tipJar = await viem.deployContract('TipJar')
        const attacker = await viem.deployContract('AttackerContract', [tipJar.address])

        await tipJar.write.tipCreator(
            [attacker.address],
            { value: parseEther('0.1') }
        )

        const tips = await tipJar.read.tips([attacker.address])
        assert.equal(tips, parseEther('0.1'))

        await assert.rejects(
            attacker.write.attemptWithdraw(),
            /ContractCallersNotSupported/
        )

        const tipsAfter = await tipJar.read.tips([attacker.address])
        assert.equal(tipsAfter, parseEther('0.1'))
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

        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            {
                account: tipper.account,
                value: parseEther('0.1')
            }
        )

        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            {
                account: tipper.account,
                value: parseEther('0.2')
            }
        )

        await tipJarAsTipper.write.tipCreator(
            [creator.account.address],
            {
                account: tipper.account,
                value: parseEther('0.3')
            }
        )

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

        await tipJarAsTipper1.write.tipCreator(
            [creator.account.address],
            {
                account: tipper1.account,
                value: parseEther('0.1')
            }
        )

        await tipJarAsTipper2.write.tipCreator(
            [creator.account.address],
            {
                account: tipper2.account,
                value: parseEther('0.25')
            }
        )

        await tipJarAsTipper3.write.tipCreator(
            [creator.account.address],
            {
                account: tipper3.account,
                value: parseEther('0.15')
            }
        )

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

        await tipJarAsTipper1.write.tipCreator(
            [creator.account.address],
            {
                account: tipper1.account,
                value: parseEther('0.5')
            }
        )

        await tipJarAsCreator.write.withdraw({
            account: creator.account
        })

        let tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, 0n)

        await tipJarAsTipper2.write.tipCreator(
            [creator.account.address],
            {
                account: tipper2.account,
                value: parseEther('0.3')
            }
        )

        tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, parseEther('0.3'))

        await tipJarAsCreator.write.withdraw({
            account: creator.account
        })

        tips = await tipJar.read.tips([creator.account.address])
        assert.equal(tips, 0n)
    })

    it('Should handle multiple creators independently', async function () {
        const { viem } = await network.connect()
        const [, tipper, creator1, creator2] = await viem.getWalletClients()

        const tipJar = await viem.deployContract('TipJar')
        const tipJarAsTipper = await viem.getContractAt('TipJar', tipJar.address)

        await tipJarAsTipper.write.tipCreator(
            [creator1.account.address],
            {
                account: tipper.account,
                value: parseEther('0.5')
            }
        )

        await tipJarAsTipper.write.tipCreator(
            [creator2.account.address],
            {
                account: tipper.account,
                value: parseEther('0.3')
            }
        )

        const tips1 = await tipJar.read.tips([creator1.account.address])
        const tips2 = await tipJar.read.tips([creator2.account.address])

        assert.equal(tips1, parseEther('0.5'))
        assert.equal(tips2, parseEther('0.3'))
    })
})
