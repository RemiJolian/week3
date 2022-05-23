
//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const { ethers } = require("hardhat");
const chai = require("chai");
const assert = chai.assert;

// const path = require("path");
const { expect } = require("chai");
const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;

exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);



describe("testing new variation of mastermind: ", function () {

    it("testing new variation of mastermind:", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let poseidon = await buildPoseidon();
        F = poseidon.F;

        const guess = [1, 2, 3, 4, 5];
        const solution = [1, 2, 3, 4, 5];

        const salt1 = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const solHash = ethers.BigNumber.from(
            F.toObject(poseidon([salt1, ...solution]))
        );
        
        //const [hit, blow] = calculateHB(guess, solution);
        const hit = solution.filter((sol, i) => {
            return sol === guess[i];
        }).length;
    
        const blow = solution.filter((sol, i) => {
            return sol !== guess[i] && guess.some((g) => g === sol);
        }).length;
        
        console.log("hit, blow: ", hit, blow);

        const INPUT = {
            "pubGuessA": guess[0],
            "pubGuessB": guess[1],
            "pubGuessC": guess[2],
            "pubGuessD": guess[3],
            "pubGuessE": guess[4],
    
            "privSolnA": solution[0],
            "privSolnB": solution[1],
            "privSolnC": solution[2],
            "privSolnD": solution[3],
            "privSolnE": solution[4],
            "pubSolnHash": solHash,
            
            "privSalt": salt1,
            "pubNumHit": hit,
            "pubNumBlow": blow
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        expect(Fr.e(witness[1])).to.equal(solHash);
    });

});