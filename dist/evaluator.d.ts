import { OnFilter, ActionContext } from './types';
export declare function evaluate(onFilter: OnFilter, context: ActionContext, token: string): Promise<boolean>;
