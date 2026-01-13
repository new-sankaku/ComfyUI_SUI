// i18n initialization and management
const I18nManager = (function() {
    const STORAGE_KEY = 'comfyui-sui-language';
    const SUPPORTED_LANGUAGES = ['ja', 'zh', 'en'];
    const DEFAULT_LANGUAGE = 'en';

    let currentLanguage = DEFAULT_LANGUAGE;
    let initialized = false;

    // Embedded translations
    const TRANSLATIONS = {
        ja: {
            menu: {
                title: "メニュー",
                generationMode: "生成モード"
            },
            modes: {
                t2i: "T2I",
                t2iLoop: "T2Iプロンプトループ",
                i2i: "I2I",
                i2iLoop: "I2Iプロンプトループ",
                i2iAngle: "I2Iアングル",
                upscaleLoop: "Upscaleループ"
            },
            config: {
                normalGeneration: "通常生成",
                workflow: "ワークフロー",
                workflowT2I: "ワークフロー (T2I)",
                workflowI2I: "ワークフロー (I2I)",
                workflowUpscale: "ワークフロー (Upscale)",
                notSelected: "未選択",
                generateCount: "生成枚数",
                generateCountPerImage: "各画像の生成枚数",
                generate: "生成",
                cancel: "キャンセル",
                loopGenerate: "ループ生成",
                angleGenerate: "アングル生成",
                upscaleGenerate: "アップスケール生成",
                promptPosition: "追加プロンプト位置",
                positionStart: "Start（先頭に追加）",
                positionEnd: "End（末尾に追加）",
                positivePromptList: "ポジティブプロンプトリスト",
                negativePromptList: "ネガティブプロンプトリスト",
                promptPerLine: "各行に1つのプロンプトを入力",
                inputImage: "入力画像",
                dropImage: "クリックまたはドラッグ&ドロップで画像を選択（複数可）",
                anglePrompt: "アングルプロンプト",
                anglePromptPerLine: "各行に1つのアングルプロンプトを入力\n例: front view\nside view\nback view",
                sendToAngle: "Angle↑送信"
            },
            tabs: {
                basic: "基本設定",
                advanced: "詳細設定",
                wildcard: "WildCard設定",
                dashboard: "ダッシュボード"
            },
            basic: {
                prompt: "プロンプト",
                promptHint: "（__name__でワイルドカード挿入）",
                promptPlaceholder: "生成したい内容を記入\n例: __quality__, 1girl, __hair_color__, __expression__",
                negativePrompt: "ネガティブプロンプト",
                negativePlaceholder: "除外したい内容を記入",
                imageSettings: "画像設定",
                width: "幅",
                height: "高さ",
                seed: "シード"
            },
            advanced: {
                connectionSettings: "接続設定",
                comfyuiUrl: "ComfyUI URL",
                metadataMarker: "Metadata Marker",
                metadataDescription: "（プロンプト等を画像に追記・オリジナル画像も保存）",
                outputEnabled: "Output Image Enabled",
                firstLineOnly: "プロンプト1行目のみ設定",
                position: "位置",
                posOverlay: "Overlay（中央）",
                posTop: "Top（上部）",
                posBottom: "Bottom（下部）",
                posRight: "Right（右）",
                posLeft: "Left（左）",
                fontSize: "Font Size",
                font: "フォント",
                opacity: "Opacity",
                fontColor: "フォントカラー",
                bgColor: "背景色",
                footerText: "Footer Text",
                footerPlaceholder: "追加テキスト（任意）"
            },
            wildcard: {
                management: "ワイルドカード管理",
                search: "検索...",
                new: "+ 新規",
                import: "インポート",
                export: "エクスポート",
                deleteAll: "全削除",
                usage: "使い方",
                reference: "ワイルドカード参照",
                hierarchy: "階層構造",
                wildcardSearch: "ワイルドカード検索",
                randomSelect: "ランダム選択",
                newWildcard: "新規ワイルドカード",
                editWildcard: "ワイルドカード編集",
                name: "名前",
                namePlaceholder: "例: colors, artists/japanese",
                values: "値（1行に1つ）",
                valuesPlaceholder: "red\nblue\ngreen",
                delete: "削除",
                save: "保存"
            },
            sidebar: {
                workflow: "ワークフロー",
                comfyuiWorkflows: "ComfyUI Workflows",
                connectionStatus: "接続状態:",
                offline: "オフライン",
                online: "オンライン",
                currentWorkflow: "ワークフロー:",
                generationStatus: "生成状態:",
                ready: "準備完了",
                generating: "生成中...",
                generationTime: "生成時間:",
                generatedImages: "生成画像",
                generatedImagesDesc: "※ComfyUIの出力フォルダにも保存されます",
                downloadAll: "一括DL",
                clear: "クリア",
                noImages: "生成された画像がここに表示されます"
            },
            history: {
                title: "履歴",
                historyButton: "履歴",
                showHistory: "履歴を表示",
                saveToHistory: "履歴に保存",
                noHistory: "履歴がありません",
                pinned: "ピン留め",
                recent: "最近",
                clearAll: "全て削除",
                confirmClear: "全ての履歴を削除しますか？",
                pin: "ピン留め",
                unpin: "ピン解除",
                delete: "削除",
                deleteImage: "画像を削除",
                imageAddedOnGenerate: "生成時に\n画像追加",
                yesterday: "昨日",
                daysAgo: "日前",
                expand: "展開",
                collapse: "折りたたみ",
                expandAll: "全て展開",
                collapseAll: "全て折りたたみ",
                apply: "適用",
                edit: "編集",
                save: "保存",
                name: "名前",
                namePlaceholder: "任意の名前を入力",
                content: "内容"
            },
            common: {
                cancel: "キャンセル",
                lines: "行",
                imageCount: "枚"
            },
            language: {
                select: "言語"
            },
            status: {
                generating: "生成中...",
                generatingProgress: "生成中... ({current}/{total})",
                generatingWithImage: "生成中... ({current}/{total}) [画像{imgCurrent}/{imgTotal}]",
                completed: "完了",
                cancelled: "キャンセル",
                cancelling: "キャンセル中...",
                error: "エラー",
                workflowNotSet: "ワークフロー未設定",
                avgTime: "Ave {avg} msec / {count}枚",
                uploadError: "アップロードエラー",
                dropImageHint: "クリックまたはドラッグ&ドロップで画像を選択（複数可）",
                noWildcards: "ワイルドカードがありません",
                noGeneratedImages: "生成された画像がここに表示されます"
            },
            confirm: {
                deleteWildcard: "「{name}」を削除しますか？",
                deleteAllWildcards: "全てのワイルドカードを削除しますか？"
            },
            toast: {
                // Error titles
                inputError: "入力エラー",
                workflowError: "ワークフローエラー",
                generationError: "生成エラー",
                comfyuiError: "ComfyUIエラー",
                uploadError: "アップロードエラー",
                initError: "初期化エラー",
                // Error messages
                enterPositivePrompt: "ポジティブプロンプトを入力してください",
                uploadImage: "画像をアップロードしてください",
                noT2IWorkflow: "有効なT2Iワークフローが見つかりません。Workflowsで設定してください。",
                noT2IWorkflowShort: "有効なT2Iワークフローが見つかりません。",
                noI2IWorkflow: "有効なI2Iワークフローが見つかりません。Workflowsで設定してください。",
                noI2IWorkflowShort: "有効なI2Iワークフローが見つかりません。",
                generationErrorDefault: "生成中にエラーが発生しました",
                uploadFailed: "画像のアップロードに失敗しました",
                enterAnglePrompt: "アングルプロンプトを入力してください",
                comfyuiConnectionFailed: "ComfyUIへの接続に失敗しました",
                checkComfyuiNode: "Check ComfyUI Node! Not Exists!",
                text2imageError: "Text2Image Error.",
                checkComfyui: "check COMFYUI!",
                networkError: "ネットワークエラーまたはComfyUIサーバーがダウンしています。",
                httpError: "HTTPエラー",
                // Other toast messages
                nothingImage: "画像が選択されていません",
                nothingPanel: "パネルが選択されていません",
                roughTarget: "ラフターゲット",
                roughTargetMessage: "ラフターゲットメッセージ",
                // Wildcard toast messages
                wildcardEnterName: "名前を入力してください",
                wildcardEnterValues: "値を1つ以上入力してください",
                wildcardSaved: "保存しました",
                wildcardSaveFailed: "保存失敗",
                wildcardDeleted: "削除しました",
                wildcardDeleteFailed: "削除失敗",
                wildcardImported: "{count}件インポートしました",
                wildcardImportFailed: "インポート失敗",
                wildcardExported: "エクスポートしました",
                wildcardAllDeleted: "全て削除しました",
                // Language change
                languageChanged: "言語設定を変更しました",
                reloadRequired: "変更を完全に適用するにはページをリロードしてください",
                reload: "リロード"
            },
            workflowEditor: {
                addWorkflow: "ワークフロー追加",
                testGenerate: "テスト生成",
                workflowHelp: "ワークフローを更新したらSaveボタンで保存してください。",
                workflowManagement: "ワークフロー管理",
                missingNode: "不明なノード",
                missingDescription: "このノードはComfyUIに存在しません。",
                workflowErrorHelp: "ワークフローを確認してください。",
                noticeTitle: "注意",
                noticeItem1: "・タイプごとに使うWorkflowを指定できます。自分で好きなWorkflowを使いたい場合はAPI用をComfyUIからExportして追加してください。",
                noticeItem2: "・ComfyUIがオンラインになると自動的にモデルリスト等が更新されます。一度でも更新するとComfyUIのモデルリストはブラウザに格納されます。",
                noticeItem3: "・seed, noise_seedに0を指定するとランダムになります。",
                noticeItem4: "・テキストに以下を指定すると置き換えます。%prompt%→ポジティブプロンプト、%negative%→ネガティブプロンプト"
            },
            dashboard: {
                title: "パフォーマンスダッシュボード",
                clearAll: "全てクリア",
                confirmClear: "全ての統計データを削除しますか？",
                totalGenerations: "総生成回数",
                globalAvg: "全体平均",
                globalMin: "全体最小",
                globalMax: "全体最大",
                uniqueTags: "ユニークタグ数",
                modeStats: "モード別統計",
                mode: "モード",
                count: "回数",
                avg: "AVG (ms)",
                min: "MIN (ms)",
                max: "MAX (ms)",
                timeGraph: "生成時間グラフ",
                recentGenerations: "直近の生成",
                topTags: "よく使われるタグ",
                noTags: "タグがありません",
                noData: "データがありません"
            },
            errorGuide: {
                // Common
                close: "閉じる",
                possibleCause: "考えられる原因",
                solution: "解決方法",
                openWorkflows: "ComfyUI Workflowsを開く",
                // ComfyUI Offline
                comfyuiOfflineTitle: "ComfyUIに接続できません",
                comfyuiOfflineMessage: "ComfyUIサーバーとの接続が確立できませんでした。生成を行うにはComfyUIが起動している必要があります。",
                comfyuiOfflineCause: "ComfyUIサーバーが起動していない、またはネットワーク接続に問題があります。",
                comfyuiOfflineStep1: "ComfyUIが起動しているか確認してください",
                comfyuiOfflineStep2: "ComfyUIのコンソールでエラーが出ていないか確認してください",
                comfyuiOfflineStep3: "詳細設定のComfyUI URLが正しいか確認してください（デフォルト: http://127.0.0.1:8188）",
                comfyuiOfflineStep4: "ファイアウォールがComfyUIの通信をブロックしていないか確認してください",
                // Workflow Not Found
                workflowNotFoundTitle: "ワークフローが設定されていません",
                workflowNotFoundMessage: "{type}用の有効なワークフローが見つかりません。生成を行うにはワークフローの設定が必要です。",
                workflowNotFoundCause: "ワークフローが登録されていない、または有効化されていません。",
                workflowNotFoundStep1: "サイドバーの「ComfyUI Workflows」ボタンをクリックしてWorkflowエディタを開きます",
                workflowNotFoundStep2: "{type}用のワークフローを追加または有効化してください",
                workflowNotFoundStep3: "ワークフローのチェックボックスがONになっていることを確認してください",
                workflowNotFoundStep4: "設定を保存して再度生成を試してください",
                // Workflow Node Missing
                workflowNodeMissingTitle: "ワークフローのノードが見つかりません",
                workflowNodeMissingMessage: "ワークフロー内で使用されているカスタムノードがComfyUIにインストールされていません。",
                workflowNodeMissingCause: "必要なカスタムノードがComfyUIにインストールされていません。",
                workflowNodeMissingStep1: "ComfyUI Workflows設定画面でテスト生成を行ってください",
                workflowNodeMissingStep2: "不足しているノードをComfyUI Managerでインストールしてください",
                workflowNodeMissingStep3: "インストール後、ComfyUIを再起動してください",
                workflowNodeMissingStep4: "それでも問題が解決しない場合は、別のワークフローを使用してください",
                missingNodesList: "不足しているノード:",
                // Network Error
                networkErrorTitle: "ネットワークエラー",
                networkErrorMessage: "ComfyUIサーバーとの通信中にエラーが発生しました。",
                networkErrorCause: "ネットワーク接続の問題、またはComfyUIサーバーがダウンしています。",
                networkErrorStep1: "インターネット接続を確認してください",
                networkErrorStep2: "ComfyUIが正常に動作しているか確認してください",
                networkErrorStep3: "ComfyUIを再起動してみてください",
                networkErrorStep4: "問題が続く場合は、ブラウザのコンソールでエラーを確認してください",
                // Generation Error
                generationErrorTitle: "生成エラー",
                generationErrorMessage: "画像生成中にエラーが発生しました。",
                generationErrorCause: "ワークフローの設定に問題があるか、ComfyUIでエラーが発生しています。",
                generationErrorStep1: "ComfyUIのコンソールでエラーメッセージを確認してください",
                generationErrorStep2: "ComfyUI Workflows設定画面でテスト生成を行うか、WorkflowをダウンロードしてComfyUI本体で確認してください",
                generationErrorStep3: "プロンプトやパラメータの設定を確認してください",
                generationErrorStep4: "問題が解決しない場合は、別のワークフローを試してください",
                // Unknown Error
                unknownErrorTitle: "エラーが発生しました",
                unknownErrorMessage: "予期しないエラーが発生しました。",
                unknownErrorCause: "原因を特定できませんでした。",
                unknownErrorStep1: "ページを再読み込みしてもう一度試してください",
                unknownErrorStep2: "問題が続く場合は、ブラウザのコンソールでエラーを確認してください"
            }
        },
        en: {
            menu: {
                title: "Menu",
                generationMode: "Generation Mode"
            },
            modes: {
                t2i: "T2I",
                t2iLoop: "T2I Prompt Loop",
                i2i: "I2I",
                i2iLoop: "I2I Prompt Loop",
                i2iAngle: "I2I Angle",
                upscaleLoop: "Upscale Loop"
            },
            config: {
                normalGeneration: "Normal Generation",
                workflow: "Workflow",
                workflowT2I: "Workflow (T2I)",
                workflowI2I: "Workflow (I2I)",
                workflowUpscale: "Workflow (Upscale)",
                notSelected: "Not Selected",
                generateCount: "Generate Count",
                generateCountPerImage: "Generate Count Per Image",
                generate: "Generate",
                cancel: "Cancel",
                loopGenerate: "Loop Generate",
                angleGenerate: "Angle Generate",
                upscaleGenerate: "Upscale Generate",
                promptPosition: "Additional Prompt Position",
                positionStart: "Start (Add to beginning)",
                positionEnd: "End (Add to end)",
                positivePromptList: "Positive Prompt List",
                negativePromptList: "Negative Prompt List",
                promptPerLine: "Enter one prompt per line",
                inputImage: "Input Image",
                dropImage: "Click or drag & drop to select images (multiple allowed)",
                anglePrompt: "Angle Prompt",
                anglePromptPerLine: "Enter one angle prompt per line\ne.g.: front view\nside view\nback view",
                sendToAngle: "Send to Angle"
            },
            tabs: {
                basic: "Basic Settings",
                advanced: "Advanced Settings",
                wildcard: "WildCard Settings",
                dashboard: "Dashboard"
            },
            basic: {
                prompt: "Prompt",
                promptHint: "(Use __name__ for wildcard)",
                promptPlaceholder: "Enter what you want to generate\ne.g.: __quality__, 1girl, __hair_color__, __expression__",
                negativePrompt: "Negative Prompt",
                negativePlaceholder: "Enter content to exclude",
                imageSettings: "Image Settings",
                width: "Width",
                height: "Height",
                seed: "Seed"
            },
            advanced: {
                connectionSettings: "Connection Settings",
                comfyuiUrl: "ComfyUI URL",
                metadataMarker: "Metadata Marker",
                metadataDescription: "(Adds prompt info to image, original also saved)",
                outputEnabled: "Output Image Enabled",
                firstLineOnly: "First line of prompt only",
                position: "Position",
                posOverlay: "Overlay (Center)",
                posTop: "Top",
                posBottom: "Bottom",
                posRight: "Right",
                posLeft: "Left",
                fontSize: "Font Size",
                font: "Font",
                opacity: "Opacity",
                fontColor: "Font Color",
                bgColor: "Background Color",
                footerText: "Footer Text",
                footerPlaceholder: "Additional text (optional)"
            },
            wildcard: {
                management: "Wildcard Management",
                search: "Search...",
                new: "+ New",
                import: "Import",
                export: "Export",
                deleteAll: "Delete All",
                usage: "Usage",
                reference: "Wildcard reference",
                hierarchy: "Hierarchy structure",
                wildcardSearch: "Wildcard search",
                randomSelect: "Random selection",
                newWildcard: "New Wildcard",
                editWildcard: "Edit Wildcard",
                name: "Name",
                namePlaceholder: "e.g.: colors, artists/japanese",
                values: "Values (one per line)",
                valuesPlaceholder: "red\nblue\ngreen",
                delete: "Delete",
                save: "Save"
            },
            sidebar: {
                workflow: "Workflow",
                comfyuiWorkflows: "ComfyUI Workflows",
                connectionStatus: "Connection Status:",
                offline: "Offline",
                online: "Online",
                currentWorkflow: "Workflow:",
                generationStatus: "Generation Status:",
                ready: "Ready",
                generating: "Generating...",
                generationTime: "Generation Time:",
                generatedImages: "Generated Images",
                generatedImagesDesc: "*Also saved to ComfyUI output folder",
                downloadAll: "Download All",
                clear: "Clear",
                noImages: "Generated images will appear here"
            },
            history: {
                title: "History",
                historyButton: "History",
                showHistory: "Show history",
                saveToHistory: "Save to history",
                noHistory: "No history",
                pinned: "Pinned",
                recent: "Recent",
                clearAll: "Clear all",
                confirmClear: "Clear all history?",
                pin: "Pin",
                unpin: "Unpin",
                delete: "Delete",
                deleteImage: "Delete image",
                imageAddedOnGenerate: "Image added\non generate",
                yesterday: "Yesterday",
                daysAgo: " days ago",
                expand: "Expand",
                collapse: "Collapse",
                expandAll: "Expand All",
                collapseAll: "Collapse All",
                apply: "Apply",
                edit: "Edit",
                save: "Save",
                name: "Name",
                namePlaceholder: "Enter optional name",
                content: "Content"
            },
            common: {
                cancel: "Cancel",
                lines: "lines",
                imageCount: "images"
            },
            language: {
                select: "Language"
            },
            status: {
                generating: "Generating...",
                generatingProgress: "Generating... ({current}/{total})",
                generatingWithImage: "Generating... ({current}/{total}) [Image {imgCurrent}/{imgTotal}]",
                completed: "Completed",
                cancelled: "Cancelled",
                cancelling: "Cancelling...",
                error: "Error",
                workflowNotSet: "Workflow not set",
                avgTime: "Ave {avg} msec / {count} images",
                uploadError: "Upload error",
                dropImageHint: "Click or drag & drop to select images (multiple allowed)",
                noWildcards: "No wildcards found",
                noGeneratedImages: "Generated images will appear here"
            },
            confirm: {
                deleteWildcard: "Delete \"{name}\"?",
                deleteAllWildcards: "Delete all wildcards?"
            },
            toast: {
                // Error titles
                inputError: "Input Error",
                workflowError: "Workflow Error",
                generationError: "Generation Error",
                comfyuiError: "ComfyUI Error",
                uploadError: "Upload Error",
                initError: "Initialization Error",
                // Error messages
                enterPositivePrompt: "Please enter a positive prompt",
                uploadImage: "Please upload an image",
                noT2IWorkflow: "No valid T2I workflow found. Please configure in Workflows.",
                noT2IWorkflowShort: "No valid T2I workflow found.",
                noI2IWorkflow: "No valid I2I workflow found. Please configure in Workflows.",
                noI2IWorkflowShort: "No valid I2I workflow found.",
                generationErrorDefault: "An error occurred during generation",
                uploadFailed: "Image upload failed",
                enterAnglePrompt: "Please enter an angle prompt",
                comfyuiConnectionFailed: "Failed to connect to ComfyUI",
                checkComfyuiNode: "Check ComfyUI Node! Not Exists!",
                text2imageError: "Text2Image Error.",
                checkComfyui: "check COMFYUI!",
                networkError: "Network error or ComfyUI server is down.",
                httpError: "HTTP Error",
                // Other toast messages
                nothingImage: "No image selected",
                nothingPanel: "No panel selected",
                roughTarget: "Rough Target",
                roughTargetMessage: "Rough target message",
                // Wildcard toast messages
                wildcardEnterName: "Please enter a name",
                wildcardEnterValues: "Please enter at least one value",
                wildcardSaved: "Saved",
                wildcardSaveFailed: "Save failed",
                wildcardDeleted: "Deleted",
                wildcardDeleteFailed: "Delete failed",
                wildcardImported: "{count} items imported",
                wildcardImportFailed: "Import failed",
                wildcardExported: "Exported",
                wildcardAllDeleted: "All deleted",
                // Language change
                languageChanged: "Language changed",
                reloadRequired: "Please reload the page to fully apply changes",
                reload: "Reload"
            },
            workflowEditor: {
                addWorkflow: "Add Workflow",
                testGenerate: "Test Generate",
                workflowHelp: "After updating a workflow, click Save to save changes.",
                workflowManagement: "Workflow Management",
                missingNode: "Unknown Node",
                missingDescription: "This node does not exist in ComfyUI.",
                workflowErrorHelp: "Please check the workflow.",
                noticeTitle: "Notice",
                noticeItem1: "- You can specify workflows per type. If you want to use your own workflow, export it for API from ComfyUI and add it.",
                noticeItem2: "- Model lists are automatically updated when ComfyUI comes online. Once updated, ComfyUI model lists are stored in the browser.",
                noticeItem3: "- Setting seed or noise_seed to 0 makes it random.",
                noticeItem4: "- Text replacements: %prompt% → positive prompt, %negative% → negative prompt"
            },
            dashboard: {
                title: "Performance Dashboard",
                clearAll: "Clear All",
                confirmClear: "Delete all statistics data?",
                totalGenerations: "Total Generations",
                globalAvg: "Global AVG",
                globalMin: "Global MIN",
                globalMax: "Global MAX",
                uniqueTags: "Unique Tags",
                modeStats: "Mode Statistics",
                mode: "Mode",
                count: "Count",
                avg: "AVG (ms)",
                min: "MIN (ms)",
                max: "MAX (ms)",
                timeGraph: "Generation Time Graph",
                recentGenerations: "Recent Generations",
                topTags: "Most Used Tags",
                noTags: "No tags recorded",
                noData: "No data available"
            },
            errorGuide: {
                // Common
                close: "Close",
                possibleCause: "Possible Cause",
                solution: "Solution",
                openWorkflows: "Open ComfyUI Workflows",
                // ComfyUI Offline
                comfyuiOfflineTitle: "Cannot Connect to ComfyUI",
                comfyuiOfflineMessage: "Could not establish connection to ComfyUI server. ComfyUI must be running to generate images.",
                comfyuiOfflineCause: "ComfyUI server is not running, or there is a network connection issue.",
                comfyuiOfflineStep1: "Check if ComfyUI is running",
                comfyuiOfflineStep2: "Check ComfyUI console for any errors",
                comfyuiOfflineStep3: "Verify ComfyUI URL in Advanced Settings (default: http://127.0.0.1:8188)",
                comfyuiOfflineStep4: "Check if firewall is blocking ComfyUI communication",
                // Workflow Not Found
                workflowNotFoundTitle: "Workflow Not Configured",
                workflowNotFoundMessage: "No valid workflow found for {type}. A workflow must be configured to generate images.",
                workflowNotFoundCause: "No workflow is registered or enabled for this generation type.",
                workflowNotFoundStep1: "Click 'ComfyUI Workflows' button in the sidebar to open the Workflow editor",
                workflowNotFoundStep2: "Add or enable a workflow for {type}",
                workflowNotFoundStep3: "Make sure the workflow checkbox is turned ON",
                workflowNotFoundStep4: "Save settings and try generating again",
                // Workflow Node Missing
                workflowNodeMissingTitle: "Workflow Node Not Found",
                workflowNodeMissingMessage: "Custom nodes used in the workflow are not installed in ComfyUI.",
                workflowNodeMissingCause: "Required custom nodes are not installed in ComfyUI.",
                workflowNodeMissingStep1: "Test generation in the ComfyUI Workflows settings",
                workflowNodeMissingStep2: "Install missing nodes using ComfyUI Manager",
                workflowNodeMissingStep3: "Restart ComfyUI after installation",
                workflowNodeMissingStep4: "If the problem persists, try using a different workflow",
                missingNodesList: "Missing nodes:",
                // Network Error
                networkErrorTitle: "Network Error",
                networkErrorMessage: "An error occurred while communicating with ComfyUI server.",
                networkErrorCause: "Network connection issue, or ComfyUI server is down.",
                networkErrorStep1: "Check your internet connection",
                networkErrorStep2: "Verify ComfyUI is working properly",
                networkErrorStep3: "Try restarting ComfyUI",
                networkErrorStep4: "If the problem continues, check browser console for errors",
                // Generation Error
                generationErrorTitle: "Generation Error",
                generationErrorMessage: "An error occurred during image generation.",
                generationErrorCause: "There may be an issue with the workflow configuration, or an error occurred in ComfyUI.",
                generationErrorStep1: "Check ComfyUI console for error messages",
                generationErrorStep2: "Test generation in ComfyUI Workflows settings, or download the workflow and test in ComfyUI",
                generationErrorStep3: "Check your prompt and parameter settings",
                generationErrorStep4: "If the problem persists, try a different workflow",
                // Unknown Error
                unknownErrorTitle: "An Error Occurred",
                unknownErrorMessage: "An unexpected error occurred.",
                unknownErrorCause: "The cause could not be determined.",
                unknownErrorStep1: "Reload the page and try again",
                unknownErrorStep2: "If the problem continues, check browser console for errors"
            }
        },
        zh: {
            menu: {
                title: "菜单",
                generationMode: "生成模式"
            },
            modes: {
                t2i: "T2I",
                t2iLoop: "T2I提示词循环",
                i2i: "I2I",
                i2iLoop: "I2I提示词循环",
                i2iAngle: "I2I角度",
                upscaleLoop: "Upscale循环"
            },
            config: {
                normalGeneration: "普通生成",
                workflow: "工作流",
                workflowT2I: "工作流 (T2I)",
                workflowI2I: "工作流 (I2I)",
                workflowUpscale: "工作流 (Upscale)",
                notSelected: "未选择",
                generateCount: "生成数量",
                generateCountPerImage: "每张图片生成数量",
                generate: "生成",
                cancel: "取消",
                loopGenerate: "循环生成",
                angleGenerate: "角度生成",
                upscaleGenerate: "放大生成",
                promptPosition: "附加提示词位置",
                positionStart: "Start（添加到开头）",
                positionEnd: "End（添加到末尾）",
                positivePromptList: "正向提示词列表",
                negativePromptList: "负向提示词列表",
                promptPerLine: "每行输入一个提示词",
                inputImage: "输入图片",
                dropImage: "点击或拖放选择图片（支持多选）",
                anglePrompt: "角度提示词",
                anglePromptPerLine: "每行输入一个角度提示词\n例如: front view\nside view\nback view",
                sendToAngle: "发送到角度"
            },
            tabs: {
                basic: "基本设置",
                advanced: "高级设置",
                wildcard: "WildCard设置",
                dashboard: "仪表板"
            },
            basic: {
                prompt: "提示词",
                promptHint: "（使用 __name__ 插入通配符）",
                promptPlaceholder: "输入想要生成的内容\n例如: __quality__, 1girl, __hair_color__, __expression__",
                negativePrompt: "负向提示词",
                negativePlaceholder: "输入要排除的内容",
                imageSettings: "图片设置",
                width: "宽度",
                height: "高度",
                seed: "种子"
            },
            advanced: {
                connectionSettings: "连接设置",
                comfyuiUrl: "ComfyUI URL",
                metadataMarker: "Metadata Marker",
                metadataDescription: "（将提示词等添加到图片・原图也会保存）",
                outputEnabled: "启用输出图片",
                firstLineOnly: "仅设置提示词第一行",
                position: "位置",
                posOverlay: "Overlay（居中）",
                posTop: "Top（顶部）",
                posBottom: "Bottom（底部）",
                posRight: "Right（右侧）",
                posLeft: "Left（左侧）",
                fontSize: "字体大小",
                font: "字体",
                opacity: "不透明度",
                fontColor: "字体颜色",
                bgColor: "背景颜色",
                footerText: "页脚文本",
                footerPlaceholder: "附加文本（可选）"
            },
            wildcard: {
                management: "通配符管理",
                search: "搜索...",
                new: "+ 新建",
                import: "导入",
                export: "导出",
                deleteAll: "全部删除",
                usage: "使用方法",
                reference: "通配符引用",
                hierarchy: "层级结构",
                wildcardSearch: "通配符搜索",
                randomSelect: "随机选择",
                newWildcard: "新建通配符",
                editWildcard: "编辑通配符",
                name: "名称",
                namePlaceholder: "例如: colors, artists/japanese",
                values: "值（每行一个）",
                valuesPlaceholder: "red\nblue\ngreen",
                delete: "删除",
                save: "保存"
            },
            sidebar: {
                workflow: "工作流",
                comfyuiWorkflows: "ComfyUI工作流",
                connectionStatus: "连接状态:",
                offline: "离线",
                online: "在线",
                currentWorkflow: "工作流:",
                generationStatus: "生成状态:",
                ready: "准备就绪",
                generating: "生成中...",
                generationTime: "生成时间:",
                generatedImages: "生成图片",
                generatedImagesDesc: "※也会保存到ComfyUI输出文件夹",
                downloadAll: "批量下载",
                clear: "清除",
                noImages: "生成的图片将显示在此处"
            },
            history: {
                title: "历史",
                historyButton: "历史",
                showHistory: "显示历史",
                saveToHistory: "保存到历史",
                noHistory: "暂无历史",
                pinned: "已固定",
                recent: "最近",
                clearAll: "全部清除",
                confirmClear: "确定要清除所有历史记录吗？",
                pin: "固定",
                unpin: "取消固定",
                delete: "删除",
                deleteImage: "删除图片",
                imageAddedOnGenerate: "生成时\n添加图片",
                yesterday: "昨天",
                daysAgo: "天前",
                expand: "展开",
                collapse: "折叠",
                expandAll: "全部展开",
                collapseAll: "全部折叠",
                apply: "应用",
                edit: "编辑",
                save: "保存",
                name: "名称",
                namePlaceholder: "输入可选名称",
                content: "内容"
            },
            common: {
                cancel: "取消",
                lines: "行",
                imageCount: "张"
            },
            language: {
                select: "语言"
            },
            status: {
                generating: "生成中...",
                generatingProgress: "生成中... ({current}/{total})",
                generatingWithImage: "生成中... ({current}/{total}) [图片{imgCurrent}/{imgTotal}]",
                completed: "完成",
                cancelled: "已取消",
                cancelling: "取消中...",
                error: "错误",
                workflowNotSet: "未设置工作流",
                avgTime: "平均 {avg} 毫秒 / {count}张",
                uploadError: "上传错误",
                dropImageHint: "点击或拖放选择图片（支持多选）",
                noWildcards: "没有通配符",
                noGeneratedImages: "生成的图片将显示在此处"
            },
            confirm: {
                deleteWildcard: "删除「{name}」？",
                deleteAllWildcards: "删除所有通配符？"
            },
            toast: {
                // Error titles
                inputError: "输入错误",
                workflowError: "工作流错误",
                generationError: "生成错误",
                comfyuiError: "ComfyUI错误",
                uploadError: "上传错误",
                initError: "初始化错误",
                // Error messages
                enterPositivePrompt: "请输入正向提示词",
                uploadImage: "请上传图片",
                noT2IWorkflow: "未找到有效的T2I工作流。请在Workflows中设置。",
                noT2IWorkflowShort: "未找到有效的T2I工作流。",
                noI2IWorkflow: "未找到有效的I2I工作流。请在Workflows中设置。",
                noI2IWorkflowShort: "未找到有效的I2I工作流。",
                generationErrorDefault: "生成过程中发生错误",
                uploadFailed: "图片上传失败",
                enterAnglePrompt: "请输入角度提示词",
                comfyuiConnectionFailed: "连接ComfyUI失败",
                checkComfyuiNode: "检查ComfyUI节点！不存在！",
                text2imageError: "Text2Image错误。",
                checkComfyui: "检查COMFYUI！",
                networkError: "网络错误或ComfyUI服务器已关闭。",
                httpError: "HTTP错误",
                // Other toast messages
                nothingImage: "未选择图片",
                nothingPanel: "未选择面板",
                roughTarget: "粗略目标",
                roughTargetMessage: "粗略目标消息",
                // Wildcard toast messages
                wildcardEnterName: "请输入名称",
                wildcardEnterValues: "请至少输入一个值",
                wildcardSaved: "已保存",
                wildcardSaveFailed: "保存失败",
                wildcardDeleted: "已删除",
                wildcardDeleteFailed: "删除失败",
                wildcardImported: "已导入{count}项",
                wildcardImportFailed: "导入失败",
                wildcardExported: "已导出",
                wildcardAllDeleted: "已全部删除",
                // Language change
                languageChanged: "语言已更改",
                reloadRequired: "请刷新页面以完全应用更改",
                reload: "刷新"
            },
            workflowEditor: {
                addWorkflow: "添加工作流",
                testGenerate: "测试生成",
                workflowHelp: "更新工作流后，请点击保存按钮保存更改。",
                workflowManagement: "工作流管理",
                missingNode: "未知节点",
                missingDescription: "此节点在ComfyUI中不存在。",
                workflowErrorHelp: "请检查工作流。",
                noticeTitle: "注意",
                noticeItem1: "・可以为每种类型指定工作流。如果想使用自己的工作流，请从ComfyUI导出API用工作流并添加。",
                noticeItem2: "・ComfyUI上线后会自动更新模型列表等。更新后，ComfyUI的模型列表会存储在浏览器中。",
                noticeItem3: "・将seed或noise_seed设为0时会随机生成。",
                noticeItem4: "・文本替换：%prompt%→正向提示词，%negative%→负向提示词"
            },
            dashboard: {
                title: "性能仪表板",
                clearAll: "全部清除",
                confirmClear: "确定要删除所有统计数据吗？",
                totalGenerations: "总生成次数",
                globalAvg: "全局平均",
                globalMin: "全局最小",
                globalMax: "全局最大",
                uniqueTags: "唯一标签数",
                modeStats: "模式统计",
                mode: "模式",
                count: "次数",
                avg: "平均 (ms)",
                min: "最小 (ms)",
                max: "最大 (ms)",
                timeGraph: "生成时间图表",
                recentGenerations: "最近生成",
                topTags: "常用标签",
                noTags: "暂无标签",
                noData: "暂无数据"
            },
            errorGuide: {
                // Common
                close: "关闭",
                possibleCause: "可能原因",
                solution: "解决方法",
                openWorkflows: "打开ComfyUI Workflows",
                // ComfyUI Offline
                comfyuiOfflineTitle: "无法连接到ComfyUI",
                comfyuiOfflineMessage: "无法与ComfyUI服务器建立连接。生成图片需要ComfyUI正在运行。",
                comfyuiOfflineCause: "ComfyUI服务器未运行，或存在网络连接问题。",
                comfyuiOfflineStep1: "检查ComfyUI是否正在运行",
                comfyuiOfflineStep2: "检查ComfyUI控制台是否有错误",
                comfyuiOfflineStep3: "在高级设置中验证ComfyUI URL（默认: http://127.0.0.1:8188）",
                comfyuiOfflineStep4: "检查防火墙是否阻止了ComfyUI通信",
                // Workflow Not Found
                workflowNotFoundTitle: "未配置工作流",
                workflowNotFoundMessage: "未找到{type}的有效工作流。需要配置工作流才能生成图片。",
                workflowNotFoundCause: "没有为此生成类型注册或启用工作流。",
                workflowNotFoundStep1: "点击侧边栏中的「ComfyUI Workflows」按钮打开工作流编辑器",
                workflowNotFoundStep2: "为{type}添加或启用工作流",
                workflowNotFoundStep3: "确保工作流复选框已开启",
                workflowNotFoundStep4: "保存设置并重试生成",
                // Workflow Node Missing
                workflowNodeMissingTitle: "找不到工作流节点",
                workflowNodeMissingMessage: "工作流中使用的自定义节点未在ComfyUI中安装。",
                workflowNodeMissingCause: "所需的自定义节点未在ComfyUI中安装。",
                workflowNodeMissingStep1: "在ComfyUI Workflows设置画面进行测试生成",
                workflowNodeMissingStep2: "使用ComfyUI Manager安装缺失的节点",
                workflowNodeMissingStep3: "安装后重启ComfyUI",
                workflowNodeMissingStep4: "如果问题仍然存在，请尝试使用其他工作流",
                missingNodesList: "缺失的节点:",
                // Network Error
                networkErrorTitle: "网络错误",
                networkErrorMessage: "与ComfyUI服务器通信时发生错误。",
                networkErrorCause: "网络连接问题，或ComfyUI服务器已关闭。",
                networkErrorStep1: "检查您的网络连接",
                networkErrorStep2: "验证ComfyUI是否正常工作",
                networkErrorStep3: "尝试重启ComfyUI",
                networkErrorStep4: "如果问题持续，请检查浏览器控制台的错误",
                // Generation Error
                generationErrorTitle: "生成错误",
                generationErrorMessage: "图片生成过程中发生错误。",
                generationErrorCause: "工作流配置可能有问题，或ComfyUI发生错误。",
                generationErrorStep1: "检查ComfyUI控制台的错误消息",
                generationErrorStep2: "在ComfyUI Workflows设置画面进行测试生成，或下载工作流后在ComfyUI本体中确认",
                generationErrorStep3: "检查您的提示词和参数设置",
                generationErrorStep4: "如果问题仍然存在，请尝试其他工作流",
                // Unknown Error
                unknownErrorTitle: "发生错误",
                unknownErrorMessage: "发生了意外错误。",
                unknownErrorCause: "无法确定原因。",
                unknownErrorStep1: "刷新页面并重试",
                unknownErrorStep2: "如果问题持续，请检查浏览器控制台的错误"
            }
        }
    };

    // Detect browser language
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const shortLang = browserLang.split('-')[0].toLowerCase();

        if (SUPPORTED_LANGUAGES.includes(shortLang)) {
            return shortLang;
        }
        return DEFAULT_LANGUAGE;
    }

    // Get saved language from localStorage
    function getSavedLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to read language from localStorage:', e);
            return null;
        }
    }

    // Save language to localStorage
    function saveLanguage(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            console.warn('Failed to save language to localStorage:', e);
        }
    }

    // Get nested translation value
    function getTranslation(key) {
        const keys = key.split('.');
        let value = TRANSLATIONS[currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return value;
    }

    // Translate a single element
    function translateElement(element) {
        const key = element.getAttribute('data-i18n');
        if (key) {
            const translation = getTranslation(key);

            // Check for attribute translations (e.g., data-i18n-placeholder)
            if (element.hasAttribute('data-i18n-attr')) {
                const attr = element.getAttribute('data-i18n-attr');
                element.setAttribute(attr, translation);
            } else {
                element.textContent = translation;
            }
        }

        // Handle placeholder separately
        const placeholderKey = element.getAttribute('data-i18n-placeholder');
        if (placeholderKey) {
            element.placeholder = getTranslation(placeholderKey);
        }
    }

    // Update all translated elements on the page
    function updatePageTranslations() {
        // Update html lang attribute
        document.documentElement.lang = currentLanguage;

        // Elements with data-i18n attribute (excluding option elements first pass)
        document.querySelectorAll('[data-i18n]:not(option)').forEach(translateElement);

        // Handle select option elements separately
        document.querySelectorAll('select option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            if (key) {
                option.textContent = getTranslation(key);
            }
        });

        // Elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                el.placeholder = getTranslation(key);
            }
        });

        // Update line count displays
        updateLineCountDisplays();

        // Dispatch event for custom handlers
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: currentLanguage }
        }));
    }

    // Update line count displays with translated text
    function updateLineCountDisplays() {
        const lineCountElements = document.querySelectorAll('.loop-line-count');
        lineCountElements.forEach(el => {
            const text = el.textContent;
            const match = text.match(/(\d+)/);
            if (match) {
                const count = match[1];
                el.textContent = `${count} ${getTranslation('common.lines')}`;
            }
        });
    }

    // Language config for dropdown
    const LANGUAGE_CONFIG = {
        ja: { flag: 'jp', name: '日本語' },
        en: { flag: 'us', name: 'English' },
        zh: { flag: 'cn', name: '中文' }
    };

    // Change language
    function changeLanguage(lang, showReloadToast = true) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return false;
        }

        if (!TRANSLATIONS[lang]) {
            console.warn(`Translations not found for: ${lang}`);
            return false;
        }

        const previousLang = currentLanguage;
        currentLanguage = lang;
        saveLanguage(lang);
        updatePageTranslations();

        // Update custom language dropdown if it exists
        updateLanguageDropdown(lang);

        // Show reload toast if language was actually changed (not during init)
        if (showReloadToast && initialized && previousLang !== lang) {
            showLanguageChangeToast();
        }

        return true;
    }

    // Show toast with reload button when language changes
    function showLanguageChangeToast() {
        const container = document.getElementById('sp-manga-toastContainer');
        if (!container) return;

        const toastId = `sp-manga-toast-lang-${Date.now()}`;
        const toast = document.createElement('div');
        toast.className = 'toast-achievement toast-nier';
        toast.id = toastId;
        toast.style.height = 'auto';
        toast.innerHTML = `
            <div class="toast-title">${getTranslation('toast.languageChanged')}</div>
            <div class="toast-message">
                <div class="sp-manga-line">${getTranslation('toast.reloadRequired')}</div>
                <button id="reloadBtn-${toastId}" style="margin-top:8px;padding:6px 16px;background:#00bcd4;border:none;border-radius:4px;color:#1a1a1a;font-weight:bold;cursor:pointer;">${getTranslation('toast.reload')}</button>
            </div>
            <div class="progress" style="height: 5px; margin-top: 5px;">
                <div class="toast-progress-bar" role="progressbar" style="width: 100%;"></div>
            </div>
        `;

        container.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, { autohide: false });
        bsToast.show();

        // Add reload button click handler
        document.getElementById(`reloadBtn-${toastId}`).addEventListener('click', () => {
            location.reload();
        });

        // Start progress bar (8 seconds)
        const progressBar = toast.querySelector('.toast-progress-bar');
        const totalDuration = 8000;
        let width = 100;
        const timer = setInterval(() => {
            width -= (10 / totalDuration * 100);
            progressBar.style.width = `${width}%`;
            if (width <= 0) {
                clearInterval(timer);
                bsToast.hide();
            }
        }, 10);

        toast.addEventListener('hidden.bs.toast', function() {
            toast.style.animation = 'sp-manga-fade-out 1s forwards';
            toast.remove();
        });
    }

    // Update custom language dropdown display
    function updateLanguageDropdown(lang) {
        const btn = document.getElementById('languageDropdownBtn');
        if (!btn) return;

        const config = LANGUAGE_CONFIG[lang];
        if (!config) return;

        const flagSpan = btn.querySelector('.fi');
        const textSpan = btn.querySelector('.language-text');

        if (flagSpan) {
            flagSpan.className = `fi fi-${config.flag}`;
        }
        if (textSpan) {
            textSpan.textContent = config.name;
        }

        // Update selected state in menu
        const options = document.querySelectorAll('.language-option');
        options.forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === lang);
        });
    }

    // Setup custom language dropdown
    function setupLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const btn = document.getElementById('languageDropdownBtn');
        const menu = document.getElementById('languageDropdownMenu');

        if (!dropdown || !btn || !menu) return;

        // Toggle dropdown on button click
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Handle option selection
        menu.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const lang = option.dataset.value;
                changeLanguage(lang);
                dropdown.classList.remove('open');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
            }
        });
    }

    // Initialize i18n
    function init() {
        if (initialized) return;

        // Setup dropdown event listeners
        setupLanguageDropdown();

        // Determine initial language: saved > browser > default
        const savedLang = getSavedLanguage();
        const initialLang = savedLang || detectBrowserLanguage();

        const success = changeLanguage(initialLang);
        if (!success && initialLang !== DEFAULT_LANGUAGE) {
            // Fallback to default if initial language failed
            changeLanguage(DEFAULT_LANGUAGE);
        }

        initialized = true;
        console.log(`i18n initialized with language: ${currentLanguage}`);
    }

    // Get current language
    function getCurrentLanguage() {
        return currentLanguage;
    }

    // Translate function for use in JS code
    function t(key) {
        return getTranslation(key);
    }

    return {
        init,
        changeLanguage,
        getCurrentLanguage,
        t,
        updatePageTranslations
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    I18nManager.init();
});
