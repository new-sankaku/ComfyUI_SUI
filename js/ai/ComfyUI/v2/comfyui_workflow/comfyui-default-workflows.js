const comfyuiDefaultWorkflows = [
    {
        name: 'inspyrenet.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByInspyrenet,
        enabled: true,
    },
    {
        name: 'rembg_RMBG-2.0.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByRMBG20,
        enabled: false,
    },
    {
        name: 'rembg_BEN2.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByBEN2,
        enabled: false,
    },
    {
        name: 'rembg_BiRefNet-toonout.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByBiRefNetToonout,
        enabled: false,
    },
    {
        name: 'rembg_BiRefNet-HR.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByBiRefNetHR,
        enabled: false,
    },
    {
        name: 'rembg_BiRefNet-portrait.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByBiRefNetPortrait,
        enabled: false,
    },
    {
        name: 'rembg_BiRefNet-matting.json',
        type: 'REMBG',
        workflow: ComfyUI_Rembg_ByBiRefNetMatting,
        enabled: false,
    },

    {
        name: 'SDXL.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySDXL,
        enabled: true,
    },
    {
        name: 'SDXL_Lora.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySDXL_Lora,
        enabled: false,
    },
    {
        name: 'SDXL_faceDetailer.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySDXL_faceDetailer,
        enabled: false,
    },
    {
        name: 'SDXL_faceDetailer_Lora.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySDXL_faceDetailer_Lora,
        enabled: false,
    },
    {
        name: 'SDXL_Refiner.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySDXL_Refiner,
        enabled: false,
    },
    {
        name: 'SD15.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySD15,
        enabled: false,
    },
    {
        name: 'SD15_VAE.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySD15_VAE,
        enabled: false,
    },
    {
        name: 'SD15_Lora.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_BySD15_Lora,
        enabled: false,
    },

    {
        name: 'FluxSimple.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_ByFluxSimple,
        enabled: false,
    },
    {
        name: 'FluxNF4.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_ByFluxNF4,
        enabled: false,
    },
    {
        name: 'FluxDiffusion.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_ByFluxDiffusion,
        enabled: false,
    },

    {
        name: 'Z_Image_turbo.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_Z_Image_turbo,
        enabled: false,
    },
    {
        name: 'Qwen_Image_gguf.json',
        type: 'T2I',
        workflow: ComfyUI_T2I_Qwen_Image_gguf,
        enabled: false,
    },

    {
        name: 'SD15_SDXL.json',
        type: 'I2I',
        workflow: ComfyUI_I2I_BySD15SDXL,
        enabled: true,
    },
    {
        name: 'ImageEdit_MultiAngle.json',
        type: 'I2I_Angle',
        workflow: ComfyUI_I2I_ImageEdit_MultiAngle,
        enabled: true,
    },

    {
        name: 'Upscaler.json',
        type: 'Upscaler',
        workflow: ComfyUI_Upscaler,
        enabled: true,
    },

    {
        name: 'audio_ace_step_1_5_split.json',
        type: 'T2A',
        workflow: ComfyUI_T2A_AudioAce,
        enabled: true,
    },
];
