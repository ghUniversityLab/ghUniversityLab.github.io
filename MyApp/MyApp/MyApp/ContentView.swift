import SwiftUI

struct ContentView: View {
    @State private var showsWelcome = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 48))
                        .foregroundStyle(Color.accentColor)
                        .accessibilityHidden(true)
                    Text("欢迎使用 MyApp")
                        .font(.largeTitle.bold())
                    Text("你的 iOS 应用从这里开始。使用 SwiftUI，构建简洁、流畅的原生界面。")
                        .foregroundStyle(.secondary)
                    VStack(alignment: .leading, spacing: 16) {
                        Label("Swift + SwiftUI", systemImage: "swift")
                        Label("支持 iPhone 和 iPad", systemImage: "iphone.and.ipad")
                        Label("自动适配深色模式", systemImage: "circle.lefthalf.filled")
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(uiColor: .secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    Button {
                        showsWelcome = true
                    } label: {
                        Text("开始体验")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(24)
                .frame(maxWidth: 640, alignment: .leading)
                .frame(maxWidth: .infinity)
            }
            .background(Color(uiColor: .systemGroupedBackground))
            .navigationTitle("首页")
            .navigationBarTitleDisplayMode(.inline)
            .alert("你好，SwiftUI！", isPresented: $showsWelcome) {
                Button("好的", role: .cancel) { }
            } message: {
                Text("项目已准备就绪，可以开始开发你的应用。")
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
        ContentView().preferredColorScheme(.dark)
    }
}

