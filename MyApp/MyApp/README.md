# MyApp — iOS SwiftUI 初始项目

使用 Swift、SwiftUI 和 Xcode 原生构建系统，无第三方依赖。

## 技术配置

- Bundle Identifier：`com.example.myapp`
- 最低版本：iOS 16.0；支持 iPhone 和 iPad
- 推荐 Xcode 15 或更新版本，以及该 Xcode 支持的 macOS
- Swift 5 语言模式（实际编译器随 Xcode 提供）
- 首页包含欢迎文案、功能列表、按钮和提示弹窗
- 系统语义颜色、动态字体、SF Symbols 和深色模式支持

## 打开和运行

1. 将 ZIP 完整解压到 macOS。
2. 使用 Xcode 打开 `MyApp.xcodeproj`。
3. 选择共享 Scheme `MyApp`，选择已安装的 iOS 16 或更新版本模拟器。
4. 按 Command + R 构建并运行。

模拟器通常无需设置开发团队。真机运行需在 Target → Signing & Capabilities 选择自己的 Team；如包标识被占用，改成自己的唯一标识。

在安装 Xcode 和所需 SDK 的 macOS 上也可执行：

```sh
xcodebuild -list -project MyApp.xcodeproj
xcodebuild -project MyApp.xcodeproj -scheme MyApp -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

## 项目文件

- `MyApp.xcodeproj/project.pbxproj`：项目、Target、Debug/Release 构建配置
- `MyApp.xcodeproj/project.xcworkspace/contents.xcworkspacedata`：内置工作区
- `MyApp.xcodeproj/xcshareddata/xcschemes/MyApp.xcscheme`：共享 Scheme
- `MyApp/MyAppApp.swift`：SwiftUI App 入口
- `MyApp/ContentView.swift`：首页与 Xcode 预览
- `MyApp/Info.plist`：应用元数据、启动页和屏幕方向
- `MyApp/Assets.xcassets`：资源目录和主题色
- `.gitignore`：忽略编译产物和个人配置

## 与 Android 要求的对应

| Android | iOS |
| --- | --- |
| Java | Swift |
| XML + ViewBinding | SwiftUI 声明式视图与状态绑定 |
| Gradle | Xcode 原生工程 / xcodebuild |
| 包名 | Bundle Identifier |
| MainActivity | MyAppApp + ContentView |
| AndroidManifest.xml | Info.plist 与 Target 配置 |
| AndroidX | Apple 原生 SwiftUI 和系统 SDK |

Android API 等级与 iOS 版本不能直接换算；这里选用 iOS 16.0，以使用 NavigationStack。

## 验证和后续工作

当前环境没有 macOS/Xcode，未实际编译、运行或验证签名。交付时检查文件结构、XML/JSON 格式和工程引用，不代表已通过 Xcode 编译。

没有复杂业务、网络服务、第三方依赖或测试 Target。无需安装 Gradle、CocoaPods 或外部 Swift 包。

未配置正式 App 图标；上架前请在 Assets 中添加 AppIcon，并设置 Target 的 App Icons Source，完善签名、隐私和发布信息。

不包含 build、DerivedData、.gradle 或其他编译缓存。

