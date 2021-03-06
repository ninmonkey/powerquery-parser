// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Ast, Type } from "../../../language";
import { NodeIdMapIterator, NodeIdMapUtils, TXorNode, XorNodeUtils } from "../../../parser";
import { inspectTypeFromChildAttributeIndex, InspectTypeState, inspectXorNode } from "./common";

export function inspectTypeRecursivePrimaryExpression(state: InspectTypeState, xorNode: TXorNode): Type.TType {
    XorNodeUtils.assertAstNodeKind(xorNode, Ast.NodeKind.RecursivePrimaryExpression);

    const maybeHead: TXorNode | undefined = NodeIdMapUtils.maybeXorChildByAttributeIndex(
        state.nodeIdMapCollection,
        xorNode.node.id,
        0,
        undefined,
    );
    if (maybeHead === undefined) {
        return Type.UnknownInstance;
    }

    const headType: Type.TType = inspectTypeFromChildAttributeIndex(state, xorNode, 0);
    if (headType.kind === Type.TypeKind.None || headType.kind === Type.TypeKind.Unknown) {
        return headType;
    }

    const maybeArrayWrapper:
        | TXorNode
        | undefined = NodeIdMapUtils.maybeXorChildByAttributeIndex(state.nodeIdMapCollection, xorNode.node.id, 1, [
        Ast.NodeKind.ArrayWrapper,
    ]);
    if (maybeArrayWrapper === undefined) {
        return Type.UnknownInstance;
    }

    const maybeExpressions: ReadonlyArray<TXorNode> | undefined = NodeIdMapIterator.expectXorChildren(
        state.nodeIdMapCollection,
        maybeArrayWrapper.node.id,
    );
    if (maybeExpressions === undefined) {
        return Type.UnknownInstance;
    }

    let leftType: Type.TType = headType;
    for (const right of maybeExpressions) {
        const rightType: Type.TType = inspectXorNode(state, right);
        leftType = rightType;
    }

    return leftType;
}
