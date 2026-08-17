const ComfyUI_Rembg_ByInspyrenet = {
    3: {
        inputs: {
            image: '00033-3787218852.png',
            upload: 'image',
        },
        class_type: 'LoadImage',
        _meta: {
            title: 'Load Image',
        },
    },
    23: {
        inputs: {
            torchscript_jit: 'default',
            image: ['3', 0],
        },
        class_type: 'InspyrenetRembg',
        _meta: {
            title: 'Inspyrenet Rembg',
        },
    },
    30: {
        inputs: {
            filename_prefix: '%date:yyyy-MM-dd%/ComfyUI_%date:yyyyMMdd_hhmmss_SSS%',
            images: ['23', 0],
        },
        class_type: 'SaveImage',
        _meta: {
            title: 'Save Image',
        },
    },
};

// ComfyUI-RMBG (1038lab) ベースの背景除去ワークフロー群。
// モデルごとに得意分野が異なるため、用途に応じてWorkflowsで有効化を切り替えて使う。
//   RMBG-2.0            : 汎用・実写向けで総合精度が最も高い
//   BEN2                : 速度と精度のバランスが良く、髪などの複雑な境界に強い
//   BiRefNet_toonout    : アニメ/イラスト特化（ToonOutでファインチューン）
//   BiRefNet-HR         : 高解像度(2048)処理で細部・毛先に強い
//   BiRefNet-portrait   : 人物ポートレートのマッティングに最適化
//   BiRefNet-matting    : 半透明・ソフトエッジ（ガラス、ベール、煙など）向け
//
// ノード構成はいずれも LoadImage -> 背景除去 -> SaveImage の3ノード。
// LoadImageのimage(文字列)のみが入力画像名で置換され、
// 背景除去ノードのimage(リンク配列)は型が異なるため置換されない。
function createRembgWorkflow(classType, title, modelInputs) {
    return {
        1: {
            inputs: {
                image: 'example.png',
                upload: 'image',
            },
            class_type: 'LoadImage',
            _meta: {
                title: 'Load Image',
            },
        },
        2: {
            inputs: {
                image: ['1', 0],
                ...modelInputs,
            },
            class_type: classType,
            _meta: {
                title: title,
            },
        },
        3: {
            inputs: {
                filename_prefix: '%date:yyyy-MM-dd%/ComfyUI_%date:yyyyMMdd_HHmmss_SSS%',
                images: ['2', 0],
            },
            class_type: 'SaveImage',
            _meta: {
                title: 'Save Image',
            },
        },
    };
}

const ComfyUI_Rembg_ByRMBG20 = createRembgWorkflow('RMBG', 'Remove Background (RMBG-2.0)', {
    model: 'RMBG-2.0',
    sensitivity: 1.0,
    process_res: 1024,
    mask_blur: 0,
    mask_offset: 0,
    invert_output: false,
    refine_foreground: true,
    background: 'Alpha',
    background_color: '#222222',
});

const ComfyUI_Rembg_ByBEN2 = createRembgWorkflow('RMBG', 'Remove Background (BEN2)', {
    model: 'BEN2',
    sensitivity: 1.0,
    process_res: 1024,
    mask_blur: 0,
    mask_offset: 0,
    invert_output: false,
    refine_foreground: true,
    background: 'Alpha',
    background_color: '#222222',
});

const ComfyUI_Rembg_ByBiRefNetToonout = createRembgWorkflow('BiRefNetRMBG', 'BiRefNet (ToonOut / Anime)', {
    model: 'BiRefNet_toonout',
    mask_blur: 0,
    mask_offset: 0,
    invert_output: false,
    refine_foreground: true,
    background: 'Alpha',
    background_color: '#222222',
});

const ComfyUI_Rembg_ByBiRefNetHR = createRembgWorkflow('BiRefNetRMBG', 'BiRefNet (High Resolution)', {
    model: 'BiRefNet-HR',
    mask_blur: 0,
    mask_offset: 0,
    invert_output: false,
    refine_foreground: true,
    background: 'Alpha',
    background_color: '#222222',
});

const ComfyUI_Rembg_ByBiRefNetPortrait = createRembgWorkflow('BiRefNetRMBG', 'BiRefNet (Portrait)', {
    model: 'BiRefNet-portrait',
    mask_blur: 0,
    mask_offset: 0,
    invert_output: false,
    refine_foreground: true,
    background: 'Alpha',
    background_color: '#222222',
});

const ComfyUI_Rembg_ByBiRefNetMatting = createRembgWorkflow('BiRefNetRMBG', 'BiRefNet (Matting)', {
    model: 'BiRefNet-matting',
    mask_blur: 0,
    mask_offset: 0,
    invert_output: false,
    refine_foreground: true,
    background: 'Alpha',
    background_color: '#222222',
});
