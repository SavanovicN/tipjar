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
})
