import { expect } from "chai";
import "mocha";
import { Lexer } from "../../lexer";
import { expectLexSuccess } from "./common";

const LINE_TERMINATOR: string = `\n`;

type AbridgedTLexerLine = ReadonlyArray<[Lexer.LineKind, Lexer.LineMode, Lexer.LineMode, string]>;

function expectAbridgedTLexerLine(state: Lexer.State, expected: AbridgedTLexerLine) {
    const actual = state.lines.map((line: Lexer.TLine) => [line.kind, line.lineModeStart, line.lineModeEnd, line.lineString.text]);
    expect(actual).deep.equal(expected);
}

describe(`Lexer.Incremental`, () => {
    describe(`Error`, () => {
        it(`Lexer.UpdateLine(less than 0)`, () => {
            const state = expectLexSuccess(``, LINE_TERMINATOR);
            expect(() => Lexer.updateLine(state, ``, -1, undefined)).to.throw(`InvariantError: lineNumber < 0 : -1 < 0`);
        });

        it(`Lexer.UpdateLine(=== state.lines.length)`, () => {
            const state = expectLexSuccess(``, LINE_TERMINATOR);
            expect(() => Lexer.updateLine(state, ``, 1, undefined)).to.throw(`InvariantError: lineNumber >= numLines : 1 >= 1`);
        });

        it(`Lexer.UpdateLine(>= state.lines.length)`, () => {
            const state = expectLexSuccess(``, LINE_TERMINATOR);
            expect(() => Lexer.updateLine(state, ``, 2, undefined)).to.throw(`InvariantError: lineNumber >= numLines : 2 >= 1`);
        });
    });

    describe(`Lexer.updateLine`, () => {
        describe(`single line`, () => {
            it(`identifier -> identifier`, () => {
                let state = expectLexSuccess(`foo`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foo`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 0, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`identifier -> unterminated string`, () => {
                let state = expectLexSuccess(`foo`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foo`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `"`, 0, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`unterminated string -> identifier`, () => {
                let state = expectLexSuccess(`"`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 0, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });
        });

        describe(`multiple lines, no mode change`, () => {
            it(`first`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 0, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`middle`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 1, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`last`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 2, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });
        });

        describe(`multiple lines, default mode to string mode`, () => {
            it(`first`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `"`, 0, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`middle`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `"`, 1, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`last`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `"`, 2, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });
        });

        describe(`multiple lines, string mode to default mode`, () => {
            it(`first`, () => {
                let state = expectLexSuccess(`"${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 0, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`middle`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}"${LINE_TERMINATOR}charlie`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 1, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });

            it(`last`, () => {
                let state = expectLexSuccess(`alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}"`, LINE_TERMINATOR);
                let expected: AbridgedTLexerLine = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                ];
                expectAbridgedTLexerLine(state, expected);

                state = Lexer.updateLine(state, `foobar`, 2, undefined);
                expected = [
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                    [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                ];
                expectAbridgedTLexerLine(state, expected);
            });
        });
    });
});