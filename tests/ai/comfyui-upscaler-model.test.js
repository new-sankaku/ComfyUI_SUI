import { describe, it, expect, beforeAll } from 'vitest';
import { loadScript } from '../helpers/load-script.js';

// アップスケーラーのmodel_name差し込みを検証する。
// model_nameは他のカスタムノードでも使われる入力名のため、
// UpscaleModelLoader以外を巻き込まないことが要点。
describe('Upscaler model injection', () => {
    let sandbox;

    beforeAll(() => {
        const builder = loadScript('js/ai/ComfyUI/v2/comfyui-workflow-builder.js', {
            workflowLogger: { trace: () => {}, debug: () => {} },
        });
        sandbox = loadScript('js/ai/ComfyUI/v2/comfyui-util.js', {
            workflowLogger: { trace: () => {}, debug: () => {} },
            createWorkflowBuilder: builder.createWorkflowBuilder,
            $: () => null,
        });
    });

    const makeWorkflow = () => ({
        1: { inputs: { image: 'example.png' }, class_type: 'LoadImage' },
        4: { inputs: { model_name: 'RealESRGAN_x4plus_anime_6B.pth' }, class_type: 'UpscaleModelLoader' },
        // model_nameという入力名を持つ別ノード（巻き込み検出用）
        9: { inputs: { model_name: 'bbox/face_yolov8m.pt' }, class_type: 'UltralyticsDetectorProvider' },
        5: { inputs: { upscale_model: ['4', 0], image: ['1', 0] }, class_type: 'ImageUpscaleWithModel' },
    });

    it('replaces model_name only on UpscaleModelLoader', () => {
        const result = sandbox.comfyuiReplacePlaceholders(
            makeWorkflow(),
            { uploadFileName: 'in.png', upscaleModelName: '4x-UltraSharp.pth' },
            'Upscaler'
        );
        expect(result['4'].inputs.model_name).toBe('4x-UltraSharp.pth');
        expect(result['9'].inputs.model_name).toBe('bbox/face_yolov8m.pt');
    });

    it('keeps the workflow value when no model is selected', () => {
        const result = sandbox.comfyuiReplacePlaceholders(
            makeWorkflow(),
            { uploadFileName: 'in.png', upscaleModelName: '' },
            'Upscaler'
        );
        expect(result['4'].inputs.model_name).toBe('RealESRGAN_x4plus_anime_6B.pth');
    });

    it('does not inject for other workflow types', () => {
        const result = sandbox.comfyuiReplacePlaceholders(
            makeWorkflow(),
            { uploadFileName: 'in.png', upscaleModelName: '4x-UltraSharp.pth' },
            'I2I'
        );
        expect(result['4'].inputs.model_name).toBe('RealESRGAN_x4plus_anime_6B.pth');
    });

    it('still replaces the input image name', () => {
        const result = sandbox.comfyuiReplacePlaceholders(
            makeWorkflow(),
            { uploadFileName: 'in.png', upscaleModelName: '4x-UltraSharp.pth' },
            'Upscaler'
        );
        expect(result['1'].inputs.image).toBe('in.png');
        expect(result['5'].inputs.image).toEqual(['1', 0]);
    });
});

describe('extractComboOptions', () => {
    let sandbox;

    beforeAll(() => {
        sandbox = loadScript('js/ai/ComfyUI/v2/comfyui-upscaler-model.js', {
            $: () => null,
            document: { addEventListener: () => {}, createElement: () => ({ setAttribute: () => {} }) },
            I18nManager: { t: (k) => k },
            objectInfoRepository: { getObjectInfo: async () => null },
        });
    });

    it('reads the legacy [[...], {}] form', () => {
        expect(sandbox.extractComboOptions([['a.pth', 'b.pth'], {}])).toEqual(['a.pth', 'b.pth']);
    });

    it('reads the ["COMBO", {options}] form', () => {
        expect(sandbox.extractComboOptions(['COMBO', { options: ['a.pth'] }])).toEqual(['a.pth']);
    });

    it('returns an empty list for unknown shapes', () => {
        expect(sandbox.extractComboOptions(undefined)).toEqual([]);
        expect(sandbox.extractComboOptions(['INT', { default: 1 }])).toEqual([]);
    });
});
